// CSRF protection middleware
const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map();

// CSRF middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Skip CSRF for API endpoints (they use JWT)
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Get CSRF token from header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  // Verify CSRF token
  if (!csrfTokens.has(csrfToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  // Remove used token (one-time use)
  csrfTokens.delete(csrfToken);
  next();
};

// Generate and send CSRF token
const generateCSRFTokenEndpoint = (req, res) => {
  const token = generateCSRFToken();
  
  // Store token with expiration (1 hour)
  csrfTokens.set(token, {
    expires: Date.now() + (60 * 60 * 1000),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Clean up expired tokens
  for (const [tokenKey, tokenData] of csrfTokens.entries()) {
    if (tokenData.expires < Date.now()) {
      csrfTokens.delete(tokenKey);
    }
  }

  res.json({
    success: true,
    csrfToken: token,
    expiresIn: 3600 // 1 hour in seconds
  });
};

module.exports = {
  csrfProtection,
  generateCSRFTokenEndpoint,
  generateCSRFToken
};