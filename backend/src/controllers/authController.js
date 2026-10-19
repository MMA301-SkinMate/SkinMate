const authService = require('../services/authService');

function getUserAgent(req) {
  return req.get('user-agent') || null;
}

function getCookie(req, name) {
  const prefix = `${name}=`;
  const cookies = (req.get('cookie') || '').split(';');
  const cookie = cookies.map(value => value.trim()).find(value => value.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function setGoogleStateCookie(res, state) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `skinmate_google_state=${encodeURIComponent(state)}; HttpOnly; SameSite=Lax; Path=/api/auth/google/callback; Max-Age=600${secure}`);
}

function clearGoogleStateCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `skinmate_google_state=; HttpOnly; SameSite=Lax; Path=/api/auth/google/callback; Max-Age=0${secure}`);
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body, getUserAgent(req));
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body, getUserAgent(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body.refreshToken, getUserAgent(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.requestPasswordReset(req.body.email);
    return res.status(202).json({
      message: 'If an active account uses this email, a password reset link will be sent shortly.',
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

function googleStart(req, res, next) {
  try {
    const { authorizationUrl, state } = authService.createGoogleAuthorization();
    setGoogleStateCookie(res, state);
    return res.redirect(302, authorizationUrl);
  } catch (error) {
    return next(error);
  }
}

function googleCallbackErrorRedirect() {
  const base = process.env.MOBILE_AUTH_DEEP_LINK_BASE;
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set('provider', 'google');
  url.searchParams.set('status', 'error');
  return url.toString();
}

async function googleCallback(req, res, next) {
  const expectedState = getCookie(req, 'skinmate_google_state');
  clearGoogleStateCookie(res);
  try {
    const redirectUrl = await authService.handleGoogleCallback({
      code: req.query.code,
      state: req.query.state,
      expectedState,
    });
    return res.redirect(302, redirectUrl);
  } catch (error) {
    const errorRedirect = googleCallbackErrorRedirect();
    if (errorRedirect) return res.redirect(302, errorRedirect);
    return next(error);
  }
}

async function exchangeGoogleCode(req, res, next) {
  try {
    const result = await authService.exchangeGoogleCode(req.body.code, getUserAgent(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleStart,
  googleCallback,
  exchangeGoogleCode,
};
