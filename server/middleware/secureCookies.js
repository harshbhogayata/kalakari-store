// Secure Cookie Configuration for Token Storage
const cookieOptions = {
  httpOnly: true, // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // Prevent CSRF attacks
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const cookieOptionsShort = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 1000 // 1 hour for refresh tokens
};

// Set secure refresh token cookie
exports.setRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, cookieOptionsShort);
};

// Set secure access token cookie
exports.setAccessToken = (res, token) => {
  res.cookie('accessToken', token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes for access tokens
  });
};

// Clear secure tokens
exports.clearTokens = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptionsShort);
};

// Get token from secure cookie
exports.getTokenFromCookie = (req) => {
  if (process.env.NODE_ENV === 'development') {
    // Allow Authorization header in development for testing
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      return req.headers.authorization.split(' ')[1];
    }
  }
  
  // Prefer httpOnly cookies in production
  return req.cookies?.accessToken || req.cookies?.refreshToken;
};

module.exports = exports;
