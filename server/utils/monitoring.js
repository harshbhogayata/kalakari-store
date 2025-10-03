// Comprehensive monitoring and metrics collection
const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatus: new Map()
      },
      performance: {
        averageResponseTime: 0,
        slowRequests: [],
        responseTimeDistribution: new Map()
      },
      errors: {
        total: 0,
        byType: new Map(),
        byEndpoint: new Map(),
        recent: []
      },
      users: {
        active: new Set(),
        total: 0,
        byRole: new Map()
      }
    };
    
    this.startTime = Date.now();
    this.logFile = path.join(__dirname, '../logs/monitoring.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // Record a request
  recordRequest(req, res, duration) {
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;
    const isSuccess = status >= 200 && status < 400;
    
    // Update counters
    this.metrics.requests.total++;
    if (isSuccess) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }
    
    // Update endpoint metrics
    if (!this.metrics.requests.byEndpoint.has(endpoint)) {
      this.metrics.requests.byEndpoint.set(endpoint, { total: 0, successful: 0, failed: 0, avgDuration: 0 });
    }
    const endpointMetrics = this.metrics.requests.byEndpoint.get(endpoint);
    endpointMetrics.total++;
    if (isSuccess) endpointMetrics.successful++;
    else endpointMetrics.failed++;
    endpointMetrics.avgDuration = (endpointMetrics.avgDuration + duration) / 2;
    
    // Update method metrics
    if (!this.metrics.requests.byMethod.has(method)) {
      this.metrics.requests.byMethod.set(method, 0);
    }
    this.metrics.requests.byMethod.set(method, this.metrics.requests.byMethod.get(method) + 1);
    
    // Update status metrics
    if (!this.metrics.requests.byStatus.has(status)) {
      this.metrics.requests.byStatus.set(status, 0);
    }
    this.metrics.requests.byStatus.set(status, this.metrics.requests.byStatus.get(status) + 1);
    
    // Update performance metrics
    this.updatePerformanceMetrics(duration, endpoint);
    
    // Record slow requests
    if (duration > 1000) { // > 1 second
      this.metrics.performance.slowRequests.push({
        endpoint,
        method,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      // Keep only last 100 slow requests
      if (this.metrics.performance.slowRequests.length > 100) {
        this.metrics.performance.slowRequests.shift();
      }
    }
    
    // Log to file
    this.logToFile({
      type: 'request',
      endpoint,
      method,
      status,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Record an error
  recordError(error, req, additionalData = {}) {
    this.metrics.errors.total++;
    
    const errorType = error.name || 'UnknownError';
    const endpoint = req.route?.path || req.path;
    
    // Update error type metrics
    if (!this.metrics.errors.byType.has(errorType)) {
      this.metrics.errors.byType.set(errorType, 0);
    }
    this.metrics.errors.byType.set(errorType, this.metrics.errors.byType.get(errorType) + 1);
    
    // Update error endpoint metrics
    if (!this.metrics.errors.byEndpoint.has(endpoint)) {
      this.metrics.errors.byEndpoint.set(endpoint, 0);
    }
    this.metrics.errors.byEndpoint.set(endpoint, this.metrics.errors.byEndpoint.get(endpoint) + 1);
    
    // Add to recent errors
    this.metrics.errors.recent.push({
      errorType,
      message: error.message,
      stack: error.stack,
      endpoint,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
    
    // Keep only last 50 errors
    if (this.metrics.errors.recent.length > 50) {
      this.metrics.errors.recent.shift();
    }
    
    // Log to file
    this.logToFile({
      type: 'error',
      errorType,
      message: error.message,
      endpoint,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  // Update performance metrics
  updatePerformanceMetrics(duration, endpoint) {
    // Update average response time
    const totalRequests = this.metrics.requests.total;
    this.metrics.performance.averageResponseTime = 
      (this.metrics.performance.averageResponseTime * (totalRequests - 1) + duration) / totalRequests;
    
    // Update response time distribution
    const bucket = Math.floor(duration / 100) * 100; // Group by 100ms buckets
    if (!this.metrics.performance.responseTimeDistribution.has(bucket)) {
      this.metrics.performance.responseTimeDistribution.set(bucket, 0);
    }
    this.metrics.performance.responseTimeDistribution.set(
      bucket, 
      this.metrics.performance.responseTimeDistribution.get(bucket) + 1
    );
  }

  // Record user activity
  recordUserActivity(userId, role, action) {
    this.metrics.users.active.add(userId);
    
    if (!this.metrics.users.byRole.has(role)) {
      this.metrics.users.byRole.set(role, 0);
    }
    this.metrics.users.byRole.set(role, this.metrics.users.byRole.get(role) + 1);
    
    // Log user activity
    this.logToFile({
      type: 'user_activity',
      userId,
      role,
      action,
      timestamp: new Date().toISOString()
    });
  }

  // Log to file
  logToFile(data) {
    try {
      const logEntry = JSON.stringify(data) + '\n';
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / (1000 * 60)),
        hours: Math.floor(uptime / (1000 * 60 * 60))
      },
      requests: {
        ...this.metrics.requests,
        byEndpoint: Object.fromEntries(this.metrics.requests.byEndpoint),
        byMethod: Object.fromEntries(this.metrics.requests.byMethod),
        byStatus: Object.fromEntries(this.metrics.requests.byStatus),
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.successful / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%'
      },
      performance: {
        ...this.metrics.performance,
        responseTimeDistribution: Object.fromEntries(this.metrics.performance.responseTimeDistribution)
      },
      errors: {
        ...this.metrics.errors,
        byType: Object.fromEntries(this.metrics.errors.byType),
        byEndpoint: Object.fromEntries(this.metrics.errors.byEndpoint),
        recent: this.metrics.errors.recent.slice(-10) // Last 10 errors
      },
      users: {
        active: this.metrics.users.active.size,
        total: this.metrics.users.total,
        byRole: Object.fromEntries(this.metrics.users.byRole)
      }
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatus: new Map()
      },
      performance: {
        averageResponseTime: 0,
        slowRequests: [],
        responseTimeDistribution: new Map()
      },
      errors: {
        total: 0,
        byType: new Map(),
        byEndpoint: new Map(),
        recent: []
      },
      users: {
        active: new Set(),
        total: 0,
        byRole: new Map()
      }
    };
    this.startTime = Date.now();
  }

  // Health check
  getHealthStatus() {
    const metrics = this.getMetrics();
    const errorRate = metrics.requests.total > 0 
      ? (metrics.errors.total / metrics.requests.total * 100)
      : 0;
    
    const avgResponseTime = metrics.performance.averageResponseTime;
    
    let status = 'healthy';
    if (errorRate > 10 || avgResponseTime > 5000) {
      status = 'unhealthy';
    } else if (errorRate > 5 || avgResponseTime > 2000) {
      status = 'degraded';
    }
    
    return {
      status,
      errorRate: errorRate.toFixed(2) + '%',
      averageResponseTime: avgResponseTime.toFixed(2) + 'ms',
      uptime: metrics.uptime,
      lastChecked: new Date().toISOString()
    };
  }
}

// Global metrics collector instance
const metricsCollector = new MetricsCollector();

// Middleware to collect request metrics
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metricsCollector.recordRequest(req, res, duration);
  });
  
  next();
};

// Middleware to collect error metrics
const errorMonitoringMiddleware = (err, req, res, next) => {
  metricsCollector.recordError(err, req);
  next(err);
};

module.exports = {
  metricsCollector,
  monitoringMiddleware,
  errorMonitoringMiddleware
};
