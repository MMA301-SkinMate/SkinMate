const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../errors/app-error');
const { sendPasswordResetEmail } = require('./emailService');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const PASSWORD_RESET_EXPIRES_IN = process.env.PASSWORD_RESET_EXPIRES_IN || '15m';
const GOOGLE_EXCHANGE_EXPIRES_IN = process.env.GOOGLE_EXCHANGE_EXPIRES_IN || '5m';
const GOOGLE_STATE_EXPIRES_IN = process.env.GOOGLE_STATE_EXPIRES_IN || '10m';

function durationToMilliseconds(value) {
  const match = String(value).match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) {
    throw new AppError('JWT expiry must use s, m, h, or d units', 500, 'INTERNAL_SERVER_ERROR');
  }
  const amount = Number(match[1]);
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const milliseconds = amount * units[match[2].toLowerCase()];
  if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) {
    throw new AppError('JWT expiry must be a positive supported duration', 500, 'INTERNAL_SERVER_ERROR');
  }
  return milliseconds;
}

function assertConfiguration() {
  if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new AppError('JWT authentication secrets are not configured', 500, 'INTERNAL_SERVER_ERROR');
  }
  durationToMilliseconds(ACCESS_EXPIRES_IN);
  durationToMilliseconds(REFRESH_EXPIRES_IN);
}

function assertGoogleConfiguration() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, MOBILE_AUTH_DEEP_LINK_BASE } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !MOBILE_AUTH_DEEP_LINK_BASE) {
    throw new AppError('Google sign-in is unavailable', 503, 'GOOGLE_AUTH_UNAVAILABLE');
  }
}

function hashToken(token, purpose) {
  assertConfiguration();
  return crypto.createHmac('sha256', REFRESH_SECRET).update(`${purpose}:${token}`).digest('hex');
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function createAccessToken(user) {
  assertConfiguration();
  return jwt.sign(
    { sub: user._id.toString(), type: 'access' },
    ACCESS_SECRET,
    { expiresIn: durationToMilliseconds(ACCESS_EXPIRES_IN) / 1000, algorithm: 'HS256' }
  );
}

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    skinProfile: user.skinProfile,
    isActive: user.isActive,
  };
}

async function issueRefreshToken(user, userAgent) {
  const refreshToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + durationToMilliseconds(REFRESH_EXPIRES_IN));
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken, 'refresh'),
    expiresAt,
    userAgent: userAgent || null,
  });
  return { refreshToken, expiresAt };
}

async function createAuthResponse(user, userAgent) {
  const accessToken = createAccessToken(user);
  const { refreshToken, expiresAt } = await issueRefreshToken(user, userAgent);
  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
}

async function register({ email, password, fullName }, userAgent) {
  assertConfiguration();
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS');
  }

  try {
    const user = await User.create({
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      fullName: fullName.trim(),
    });
    return createAuthResponse(user, userAgent);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS');
    }
    throw error;
  }
}

async function login({ email, password }, userAgent) {
  assertConfiguration();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  user.lastLoginAt = new Date();
  await user.save();
  return createAuthResponse(user, userAgent);
}

async function refresh(refreshToken, userAgent) {
  assertConfiguration();
  const storedToken = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken, 'refresh') });
  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    throw new AppError('Refresh token is invalid or expired', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await User.findOne({ _id: storedToken.userId, isActive: true });
  if (!user) {
    throw new AppError('User account is inactive', 401, 'INACTIVE_ACCOUNT');
  }

  const revoked = await RefreshToken.updateOne(
    { _id: storedToken._id, revokedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { revokedAt: new Date() } }
  );
  if (revoked.modifiedCount !== 1) {
    throw new AppError('Refresh token is invalid or expired', 401, 'INVALID_REFRESH_TOKEN');
  }
  return createAuthResponse(user, userAgent);
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken, 'refresh'), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

function buildPasswordResetUrl(token) {
  const base = process.env.PASSWORD_RESET_DEEP_LINK_BASE;
  if (!base) {
    throw new AppError('Email service is unavailable', 503, 'EMAIL_SERVICE_UNAVAILABLE');
  }
  const url = new URL(base);
  url.searchParams.set('token', token);
  return url.toString();
}

async function requestPasswordReset(email) {
  assertConfiguration();
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail, isActive: true });
  if (!user) return;

  const token = createOpaqueToken();
  const tokenHash = hashToken(token, 'password-reset');
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + durationToMilliseconds(PASSWORD_RESET_EXPIRES_IN));
  await user.save();

  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl: buildPasswordResetUrl(token) });
  } catch {
    await User.updateOne(
      { _id: user._id, passwordResetTokenHash: tokenHash },
      {
        $set: {
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
      }
    );
  }
}

async function resetPassword({ token, password }) {
  assertConfiguration();
  const tokenHash = hashToken(token, 'password-reset');
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const user = await User.findOneAndUpdate(
    {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: now },
      isActive: true,
    },
    {
      $set: {
        passwordHash,
        passwordChangedAt: now,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    },
    { new: true }
  );
  if (!user) {
    throw new AppError('Reset token is invalid or expired', 400, 'INVALID_RESET_TOKEN');
  }

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: now } }
  );
}

function createGoogleState() {
  assertGoogleConfiguration();
  return jwt.sign(
    { type: 'google-oauth-state', nonce: crypto.randomBytes(24).toString('base64url') },
    REFRESH_SECRET,
    { expiresIn: durationToMilliseconds(GOOGLE_STATE_EXPIRES_IN) / 1000, algorithm: 'HS256' }
  );
}

function getGoogleClient() {
  assertGoogleConfiguration();
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function createGoogleAuthorization() {
  const state = createGoogleState();
  return {
    state,
    authorizationUrl: getGoogleClient().generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state,
    }),
  };
}

function verifyGoogleState(state, expectedState) {
  if (!expectedState || state !== expectedState) {
    throw new AppError('Google sign-in request is invalid or expired', 400, 'INVALID_GOOGLE_STATE');
  }
  try {
    const payload = jwt.verify(state, REFRESH_SECRET, { algorithms: ['HS256'] });
    if (payload.type !== 'google-oauth-state' || typeof payload.nonce !== 'string') {
      throw new Error('Invalid OAuth state');
    }
  } catch {
    throw new AppError('Google sign-in request is invalid or expired', 400, 'INVALID_GOOGLE_STATE');
  }
}

function buildMobileAuthUrl(code, status) {
  const url = new URL(process.env.MOBILE_AUTH_DEEP_LINK_BASE);
  url.searchParams.set('provider', 'google');
  url.searchParams.set('status', status);
  if (code) url.searchParams.set('code', code);
  return url.toString();
}

async function handleGoogleCallback({ code, state, expectedState }) {
  verifyGoogleState(state, expectedState);
  try {
    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new Error('Missing Google identity token');

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile || !profile.sub || !profile.email || profile.email_verified !== true) {
      throw new Error('Google identity has no verified email');
    }

    const email = profile.email.toLowerCase().trim();
    let user = await User.findOne({ $or: [{ googleSubject: profile.sub }, { email }] });
    if (user && !user.isActive) {
      throw new AppError('User account is inactive', 401, 'INACTIVE_ACCOUNT');
    }
    if (!user) {
      user = await User.create({
        email,
        fullName: profile.name || email.split('@')[0],
        avatarUrl: profile.picture || null,
        googleSubject: profile.sub,
        passwordHash: await bcrypt.hash(createOpaqueToken(), 12),
      });
    } else if (!user.googleSubject) {
      user.googleSubject = profile.sub;
      if (!user.avatarUrl && profile.picture) user.avatarUrl = profile.picture;
      await user.save();
    } else if (user.googleSubject !== profile.sub) {
      throw new AppError('Google account cannot be linked', 409, 'GOOGLE_ACCOUNT_CONFLICT');
    }

    const exchangeCode = createOpaqueToken();
    user.googleExchangeCodeHash = hashToken(exchangeCode, 'google-exchange');
    user.googleExchangeCodeExpiresAt = new Date(Date.now() + durationToMilliseconds(GOOGLE_EXCHANGE_EXPIRES_IN));
    user.lastLoginAt = new Date();
    await user.save();
    return buildMobileAuthUrl(exchangeCode, 'success');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Google sign-in failed', 401, 'GOOGLE_AUTH_FAILED');
  }
}

async function exchangeGoogleCode(code, userAgent) {
  const now = new Date();
  const user = await User.findOneAndUpdate(
    {
      googleExchangeCodeHash: hashToken(code, 'google-exchange'),
      googleExchangeCodeExpiresAt: { $gt: now },
      isActive: true,
    },
    {
      $set: {
        googleExchangeCodeHash: null,
        googleExchangeCodeExpiresAt: null,
      },
    },
    { new: true }
  );
  if (!user) {
    throw new AppError('Google sign-in code is invalid or expired', 401, 'INVALID_GOOGLE_EXCHANGE_CODE');
  }

  return createAuthResponse(user, userAgent);
}

function verifyAccessToken(token) {
  assertConfiguration();
  const payload = jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
  if (payload.type !== 'access' || typeof payload.sub !== 'string' || !/^[a-f\d]{24}$/i.test(payload.sub)) {
    throw new AppError('Invalid access token', 401, 'INVALID_ACCESS_TOKEN');
  }
  return payload;
}

module.exports = {
  assertConfiguration,
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  createGoogleAuthorization,
  handleGoogleCallback,
  exchangeGoogleCode,
  verifyAccessToken,
  toSafeUser,
};
