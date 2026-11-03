const { createHash, randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const authSessionService = require('./authSessionService');
const AppError = require('../utils/AppError');

// Public dummy hash with the same Argon2id cost as registration. Unknown emails
// still perform password verification instead of returning before the hash work.
const DUMMY_PASSWORD_HASH =
    '$argon2id$v=19$m=19456,p=1,t=2$/eeM6oeuJB3Mi9K3y+bdzw$ye6PUa0KUbW3G9z38oddTyYTAGY6zFzv4+87/MFBE18';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const JWT_ISSUER = 'skinmate-api';

const toPublicUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
});

const createAccessToken = (userId, sessionId, config) => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + ACCESS_TOKEN_TTL_SECONDS;
    const token = jwt.sign(
        { sub: String(userId), sid: String(sessionId), iat: issuedAt, jti: randomUUID(), exp: expiresAt },
        config.jwtAccessSecret,
        { algorithm: 'HS256', issuer: JWT_ISSUER, audience: 'skinmate-mobile' }
    );
    return { token, expiresAt: new Date(expiresAt * 1000).toISOString() };
};

const emailAlreadyExists = () =>
    new AppError(
        'Email này đã được đăng ký. Vui lòng đăng nhập.',
        409,
        'EMAIL_ALREADY_EXISTS',
        [{ field: 'email', message: 'Email này đã được đăng ký.' }]
    );

const isTransactionUnsupported = (error) =>
    /Transaction numbers are only allowed|does not support (?:retryable writes|transactions)/i.test(
        String(error?.message || '')
    );

const register = async (input, config) => {
    const email = input.email.trim().toLowerCase();

    if (await User.exists({ email })) {
        throw emailAlreadyExists();
    }

    // Hash before opening the transaction so expensive CPU work holds no locks.
    const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    });

    const createRegistration = async (session) => {
        const user = new User({
            fullName: input.fullName,
            email,
            passwordHash,
            termsAcceptedAt: new Date(),
            termsVersion: config.termsVersion,
            privacyVersion: config.privacyVersion,
        });
        await user.save(session ? { session } : undefined);

        const tokens = await authSessionService.createInitialSession(user, config, session);

        return {
            user: toPublicUser(user),
            ...tokens,
        };
    };

    try {
        return await mongoose.connection.transaction(createRegistration);
    } catch (error) {
        // A local standalone MongoDB does not support transactions. Fall back
        // to the same two writes so development registration still works.
        if (isTransactionUnsupported(error)) {
            try {
                return await createRegistration();
            } catch (fallbackError) {
                if (
                    fallbackError.code === 11000 &&
                    (fallbackError.keyPattern?.email || fallbackError.keyValue?.email)
                ) {
                    throw emailAlreadyExists();
                }
                throw fallbackError;
            }
        }

        // The unique index is authoritative when registrations race each other.
        if (
            error.code === 11000 &&
            (error.keyPattern?.email || error.keyValue?.email)
        ) {
            throw emailAlreadyExists();
        }
        throw error;
    }
};

const login = async (input, config) => {
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordMatches = await argon2.verify(
        user ? user.passwordHash : DUMMY_PASSWORD_HASH,
        input.password
    );

    if (!user || user.isActive === false || !passwordMatches) {
        throw new AppError(
            'Email hoặc mật khẩu không đúng.',
            401,
            'INVALID_CREDENTIALS'
        );
    }

    const tokens = await authSessionService.createInitialSession(user, config);

    return { user: toPublicUser(user), ...tokens };
};

const refresh = async (refreshToken, config) => {
    if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new AppError('Refresh token is required.', 401, 'INVALID_REFRESH_TOKEN');
    }

    let claims;
    try {
        claims = jwt.verify(refreshToken, config.jwtRefreshSecret, {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER,
            audience: 'skinmate-refresh',
        });
    } catch {
        throw new AppError('Refresh token is invalid or expired.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const session = await AuthSession.findOne({
        _id: claims.sid,
        userId: claims.sub,
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }).select('+refreshTokenHash');

    if (!session) {
        throw new AppError('Refresh token is invalid or expired.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(session.userId);
    if (!user || user.isActive === false) {
        throw new AppError('User account is inactive.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const access = createAccessToken(user._id, session._id, config);
    return {
        user: toPublicUser(user),
        accessToken: access.token,
        refreshToken,
        accessTokenExpiresAt: access.expiresAt,
        refreshTokenExpiresAt: session.expiresAt.toISOString(),
    };
};

module.exports = { register, login, refresh };
