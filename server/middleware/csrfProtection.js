const crypto = require('crypto');

// CSRF Protection Middleware
class CSRFProtection {
  constructor() {
    this.generateToken = this.generateToken.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.middleware = this.middleware.bind(this);
    this.setTokenEndpoint = this.setTokenEndpoint.bind(this);
  }

  // Generate a cryptographically secure CSRF token
  generateToken(sessionId) {
    const secret = process.env.CSRF_SECRET || this.generateSecret();
    const timestamp = Date.now().toString();
    const randomValue = crypto.randomBytes(32).toString('hex');
    
    // Create token payload
    const payload = `${sessionId || 'anonymous'}:${timestamp}:${randomValue}`;
    
    // Sign the token
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return Buffer.from(`${payload}:${signature}`).toString('base64');
  }

  // Validate CSRF token
  validateToken(token, sessionId) {
    try {
      const secret = process.env.CSRF_SECRET || this.generateSecret();
      
      // Decode token
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      
      if (parts.length !== 4) {
        return false;
      }
      
      const [tokenSessionId, timestamp, randomValue, signature] = parts;
      
      // Check session ID match
      if (sessionId && tokenSessionId !== sessionId && tokenSessionId !== 'anonymous') {
        return false;
      }
      
      // Check token age (max 1 hour)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 60 * 60 * 1000) { //  or tokenAge < 0
        return false;
      }
      
      // Verify signature
      const payload = `${tokenSessionId}:${timestamp}:${randomValue}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  // Generate CSRF secret if not provided
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  // CSRF middleware
  middleware(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for public API endpoints
    const skipPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/payment/webhook', // Webhook endpoints
      '/health'
    ];

    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Get CSRF token from headers or body
    const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;
    const sessionId = req.session?.id || 'anonymous';

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token missing',
        error: 'Missing CSRF token in request'
      });
    }

    if (!this.validateToken(token, sessionId)) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token invalid',
        error: 'CSRF token validation failed'
      });
    }

    next();
  }

  // Generate and set CSRF token endpoint
  setTokenEndpoint(req, res, next) {
    // Allow CSRF token generation for both authenticated and unauthenticated users
    // This is needed for registration and other public forms
    
    const token = this.generateToken(req.session?.id);
    
    // Set token in session for server-side validation
    if (req.session) {
      req.session.csrfToken = token;
    }

    // Send token to client
    res.json({
      success: true,
      csrfToken: token,
      message: 'CSRF token generated successfully'
    });
  }
}

// Export singleton instance
const csrfProtection = new CSRFProtection();

module.exports = {
  csrfProtection: csrfProtection.middleware,
  generateCSRFToken: csrfProtection.generateToken,
  validateCSRFToken: csrfProtection.validateToken,
  setCSRFTokenEndpoint: csrfProtection.setTokenEndpoint
};
