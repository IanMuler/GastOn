const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const config = require('../config/environment');

/**
 * Centralized error handling middleware
 * 
 * Handles all types of errors in a consistent way
 * Provides appropriate responses for different error types
 */

/**
 * Global error handler middleware
 * Must be placed last in middleware chain
 */
const errorHandler = (error, req, res, next) => {
  let apiError = error;

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    apiError = convertToApiError(error);
  }

  // Log error for debugging
  logError(apiError, req);

  // Send error response
  const response = ApiResponse.error(
    apiError.message,
    apiError.statusCode,
    apiError.errors
  );

  // Add stack trace in development
  if (config.isDevelopment && apiError.stack) {
    response.stack = apiError.stack;
  }

  res.status(apiError.statusCode).json(response);
};

/**
 * Convert various error types to ApiError
 */
function convertToApiError(error) {
  // Database errors
  if (error.code) {
    return convertDatabaseError(error);
  }

  // Validation errors from express-validator
  if (error.array && typeof error.array === 'function') {
    return ApiError.fromValidationResults(error.array());
  }

  // JSON parsing errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return ApiError.badRequest('Invalid JSON format');
  }

  // Express built-in errors
  if (error.status) {
    return new ApiError(error.message, error.status);
  }

  // Default to internal server error
  return ApiError.internal(
    config.isDevelopment ? error.message : 'Internal Server Error'
  );
}

/**
 * Convert database-specific errors to user-friendly ApiErrors
 */
function convertDatabaseError(error) {
  switch (error.code) {
    case '23505': // Unique constraint violation
      const field = extractUniqueConstraintField(error.detail);
      return ApiError.conflict(`${field} already exists`);
      
    case '23503': // Foreign key constraint violation
      return ApiError.badRequest('Referenced resource does not exist');
      
    case '23502': // Not null constraint violation
      const column = error.column || 'field';
      return ApiError.badRequest(`${column} is required`);
      
    case '23514': // Check constraint violation
      return ApiError.badRequest('Data violates constraint rules');
      
    case '42703': // Undefined column
      return ApiError.badRequest('Invalid field specified');
      
    case '42P01': // Undefined table
      return ApiError.internal('Database schema error');
      
    case '53300': // Too many connections
      return ApiError.error('Service temporarily unavailable', 503);
      
    case 'ECONNREFUSED':
    case '53200': // Out of memory
      return ApiError.error('Database connection failed', 503);
      
    default:
      return ApiError.database('Database operation failed', error);
  }
}

/**
 * Extract field name from unique constraint error detail
 */
function extractUniqueConstraintField(errorDetail) {
  if (!errorDetail) return 'Field';
  
  // Extract field name from error detail like "Key (nombre)=(value) already exists."
  const match = errorDetail.match(/Key \(([^)]+)\)/);
  return match ? match[1] : 'Field';
}

/**
 * Log errors with appropriate level and context
 */
function logError(error, req) {
  const logContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: error.statusCode,
    message: error.message,
  };

  // Add request body for debugging (excluding sensitive data)
  if (config.isDevelopment && req.body) {
    logContext.body = sanitizeLogData(req.body);
  }

  // Different log levels based on error type
  if (error.statusCode >= 500) {
    console.error('🔥 Server Error:', logContext, error.stack);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️  Client Error:', logContext);
  } else {
    console.log('ℹ️  Info:', logContext);
  }
}

/**
 * Remove sensitive data from logs
 */
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request timeout middleware
 */
const timeoutHandler = (timeoutMs = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeoutMs, () => {
      const error = ApiError.error('Request timeout', 408);
      next(error);
    });
    next();
  };
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // API-specific headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  if (config.isDevelopment) {
    console.log(`📨 ${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? console.error : console.log;
    
    if (config.isDevelopment) {
      logLevel(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Health check for error handler
 */
const healthCheck = (req, res) => {
  res.status(200).json(
    ApiResponse.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      uptime: process.uptime(),
    }, 'Error handler is working')
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  timeoutHandler,
  securityHeaders,
  requestLogger,
  healthCheck,
};