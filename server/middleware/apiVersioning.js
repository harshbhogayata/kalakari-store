/**
 * API Versioning Middleware
 * Handles API versioning and backward compatibility
 */

const apiVersions = {
  'v1': {
    version: '1.0.0',
    status: 'current',
    deprecated: false,
    sunsetDate: null,
    routes: [
      '/api/auth',
      '/api/products', 
      '/api/orders',
      '/api/artisans',
      '/api/cart',
      '/api/wishlist',
      '/api/reviews',
      '/api/admin',
      '/api/search',
      '/api/health'
    ]
  }
};

const getApiVersion = (req) => {
  // Check for version in header
  const versionHeader = req.headers['api-version'];
  if (versionHeader && apiVersions[versionHeader]) {
    return versionHeader;
  }
  
  // Check for version in query parameter
  const versionQuery = req.query.version;
  if (versionQuery && apiVersions[versionQuery]) {
    return versionQuery;
  }
  
  // Check for version in path (e.g., /api/v1/products)
  const pathMatch = req.path.match(/^\/api\/v(\d+)/);
  if (pathMatch) {
    const version = `v${pathMatch[1]}`;
    if (apiVersions[version]) {
      return version;
    }
  }
  
  // Default to latest version
  return 'v1';
};

const apiVersioning = (req, res, next) => {
  const version = getApiVersion(req);
  const versionInfo = apiVersions[version];
  
  // Add version info to request
  req.apiVersion = version;
  req.apiVersionInfo = versionInfo;
  
  // Add version headers to response
  res.set({
    'API-Version': versionInfo.version,
    'API-Status': versionInfo.status,
    'API-Deprecated': versionInfo.deprecated ? 'true' : 'false'
  });
  
  // Add deprecation warning if applicable
  if (versionInfo.deprecated) {
    res.set('API-Deprecation-Warning', `API version ${version} is deprecated`);
  }
  
  // Add sunset date if applicable
  if (versionInfo.sunsetDate) {
    res.set('API-Sunset', versionInfo.sunsetDate);
  }
  
  next();
};

const validateApiVersion = (req, res, next) => {
  const version = req.apiVersion;
  const versionInfo = req.apiVersionInfo;
  
  // Check if version exists
  if (!versionInfo) {
    return res.status(400).json({
      success: false,
      message: `Invalid API version: ${version}`,
      availableVersions: Object.keys(apiVersions),
      requestId: req.requestId
    });
  }
  
  // Check if version is deprecated and warn
  if (versionInfo.deprecated) {
    console.warn(`Deprecated API version used: ${version} for ${req.path}`);
  }
  
  next();
};

module.exports = {
  apiVersioning,
  validateApiVersion,
  apiVersions
};
