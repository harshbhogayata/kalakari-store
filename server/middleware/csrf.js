// CSRF protection middleware
const crypto = require('crypto');
const mongoose = require('mongoose');

// Define CSRF Token Schema
const csrfTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ip: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  }
});

// Create CSRF Token model
let CSRFToken;
try {
  CSRFToken = mongoose.model('CSRFToken');
} catch (error) {
  CSRFToken = mongoose.model('CSRFToken', csrfTokenSchema);
}

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Fallback in-memory storage for development
const csrfTokens = new Map();

// CSRF middleware
const csrfProtection = async (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Skip CSRF for specific endpoints (webhooks, health checks)
  const skipPaths = ['/api/payment/webhook', '/api/health', '/api/auth/register'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
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

  try {
    // Try to verify using MongoDB (production)
    if (CSRFToken && process.env.NODE_ENV === 'production') {
      const tokenRecord = await CSRFToken.findOne({ token: csrfToken });
      
      if (!tokenRecord) {
        return res.status(403).json({
          success: false,
          message: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        });
      }

      // Validate IP and User Agent for additional security
      if (tokenRecord.ip !== req.ip || tokenRecord.userAgent !== req.get('User-Agent')) {
        console.warn(`⚠️ CSRF token mismatch for ${req.path}: IP or User-Agent changed`);
        // Don't reject, just log (users might change networks)
      }

      // Delete used token (one-time use)
      await CSRFToken.deleteOne({ _id: tokenRecord._id });
    } else {
      // Fallback to in-memory storage for development
      if (!csrfTokens.has(csrfToken)) {
        return res.status(403).json({
          success: false,
          message: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        });
      }

      // Remove used token
      csrfTokens.delete(csrfToken);
    }

    next();
  } catch (error) {
    console.error('CSRF verification error:', error);
    res.status(500).json({
      success: false,
      message: 'CSRF verification failed'
    });
  }
};

// Generate and send CSRF token endpoint
const generateCSRFTokenEndpoint = async (req, res) => {
  try {
    const token = generateCSRFToken();
    
    try {
      // Try to store in MongoDB (production)
      if (CSRFToken && process.env.NODE_ENV === 'production') {
        await CSRFToken.create({
          token,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      } else {
        // Fallback to in-memory storage
        csrfTokens.set(token, {
          expires: Date.now() + (60 * 60 * 1000),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        // Clean up expired tokens periodically
        if (csrfTokens.size > 10000) {
          for (const [tokenKey, tokenData] of csrfTokens.entries()) {
            if (tokenData.expires < Date.now()) {
              csrfTokens.delete(tokenKey);
            }
          }
        }
      }
    } catch (dbError) {
      // If MongoDB fails, use in-memory as fallback
      console.warn('⚠️ Could not store CSRF token in MongoDB, using in-memory storage:', dbError.message);
      csrfTokens.set(token, {
        expires: Date.now() + (60 * 60 * 1000),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      csrfToken: token,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSRF token'
    });
  }
};

// Also export setCSRFTokenEndpoint for backward compatibility
const setCSRFTokenEndpoint = generateCSRFTokenEndpoint;

module.exports = {
  csrfProtection,
  generateCSRFTokenEndpoint,
  setCSRFTokenEndpoint,
  generateCSRFToken,
  CSRFToken
};