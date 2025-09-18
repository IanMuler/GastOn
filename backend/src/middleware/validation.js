const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware using express-validator
 * 
 * Provides common validation rules for the expense tracking API
 * Ensures data integrity and security
 */

// Category validation rules
const categoryValidation = {
  create: [
    body('nombre')
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name must be between 1 and 100 characters')
      .trim(),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex code (e.g., #FF5733)')
      .toUpperCase(),
  ],
  
  update: [
    body('nombre')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name must be between 1 and 100 characters')
      .trim(),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex code (e.g., #FF5733)')
      .toUpperCase(),
  ],
};

// Expense name validation rules
const expenseNameValidation = {
  create: [
    body('nombre')
      .notEmpty()
      .withMessage('Expense name is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('Expense name must be between 1 and 200 characters')
      .trim(),
    
    body('categoria_sugerida_id')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('Suggested category ID must be a positive integer'),
  ],
  
  update: [
    body('nombre')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Expense name must be between 1 and 200 characters')
      .trim(),
    
    body('categoria_sugerida_id')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('Suggested category ID must be a positive integer'),
  ],
};

// Expense validation rules
const expenseValidation = {
  create: [
    body('monto')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.01, max: 99999999.99 })
      .withMessage('Amount must be between 0.01 and 99,999,999.99'),
    
    body('fecha')
      .optional()
      .isISO8601({ strict: true })
      .withMessage('Date must be in YYYY-MM-DD format')
      .custom((value) => {
        if (value) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          
          if (date > today) {
            throw new Error('Expense date cannot be in the future');
          }
        }
        return true;
      }),
    
    body('categoria_id')
      .notEmpty()
      .withMessage('Category ID is required')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    
    body('nombre_gasto_id')
      .notEmpty()
      .withMessage('Expense name ID is required')
      .isInt({ min: 1 })
      .withMessage('Expense name ID must be a positive integer'),
    
    body('descripcion')
      .optional({ nullable: true })
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
  ],
  
  update: [
    body('monto')
      .optional()
      .isFloat({ min: 0.01, max: 99999999.99 })
      .withMessage('Amount must be between 0.01 and 99,999,999.99'),
    
    body('fecha')
      .optional()
      .isISO8601({ strict: true })
      .withMessage('Date must be in YYYY-MM-DD format')
      .custom((value) => {
        if (value) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          
          if (date > today) {
            throw new Error('Expense date cannot be in the future');
          }
        }
        return true;
      }),
    
    body('categoria_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    
    body('nombre_gasto_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Expense name ID must be a positive integer'),
    
    body('descripcion')
      .optional({ nullable: true })
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
  ],
};

// Parameter validation rules
const paramValidation = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
  ],
  
  categoryId: [
    param('categoryId')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
  ],
  
  date: [
    param('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format')
      .custom((value) => {
        const date = new Date(value + 'T00:00:00');
        if (isNaN(date)) {
          throw new Error('Invalid date');
        }
        return true;
      }),
  ],
};

// Query parameter validation rules
const queryValidation = {
  dateRange: [
    query('fecha_inicio')
      .notEmpty()
      .withMessage('Start date (fecha_inicio) is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Start date must be in YYYY-MM-DD format'),
    
    query('fecha_fin')
      .notEmpty()
      .withMessage('End date (fecha_fin) is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('End date must be in YYYY-MM-DD format')
      .custom((value, { req }) => {
        if (value && req.query.fecha_inicio) {
          const startDate = new Date(req.query.fecha_inicio);
          const endDate = new Date(value);
          
          if (endDate < startDate) {
            throw new Error('End date must be after or equal to start date');
          }
          
          // Limit date range to prevent performance issues
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > 365) {
            throw new Error('Date range cannot exceed 365 days');
          }
        }
        return true;
      }),
    
    query('categoria_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  
  search: [
    query('q')
      .notEmpty()
      .withMessage('Search query (q) is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
      .trim(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  
  month: [
    query('month')
      .optional()
      .matches(/^\d{4}-\d{2}$/)
      .withMessage('Month must be in YYYY-MM format'),
  ],
  
  limit: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  
  weekOffset: [
    query('offset')
      .optional()
      .isInt({ min: -52, max: 52 })
      .withMessage('Week offset must be between -52 and 52'),
  ],
};

// Bulk operations validation
const bulkValidation = {
  delete: [
    body('ids')
      .isArray({ min: 1, max: 100 })
      .withMessage('IDs must be an array with 1 to 100 elements'),
    
    body('ids.*')
      .isInt({ min: 1 })
      .withMessage('Each ID must be a positive integer'),
  ],
};

/**
 * Middleware to handle validation results
 * Converts express-validator errors to ApiError format
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));
    
    throw ApiError.fromValidationResults(errors.array());
  }
  
  next();
};

/**
 * Sanitize request body to prevent unwanted fields
 */
const sanitizeBody = (allowedFields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      const sanitized = {};
      
      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          sanitized[field] = req.body[field];
        }
      }
      
      req.body = sanitized;
    }
    
    next();
  };
};

/**
 * Rate limiting validation (simple implementation)
 * In production, use a proper rate limiting library like express-rate-limit
 */
const basicRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }
    
    // Check current client
    const clientRequests = requests.get(clientId) || [];
    const validRequests = clientRequests.filter(ts => ts > windowStart);
    
    if (validRequests.length >= maxRequests) {
      throw ApiError.error('Too many requests', 429);
    }
    
    validRequests.push(now);
    requests.set(clientId, validRequests);
    
    next();
  };
};

module.exports = {
  categoryValidation,
  expenseNameValidation,
  expenseValidation,
  paramValidation,
  queryValidation,
  bulkValidation,
  handleValidationErrors,
  sanitizeBody,
  basicRateLimit,
};