/**
 * ApiError - Custom error class for API operations
 * 
 * Extends native Error with additional properties for HTTP status codes
 * and structured error handling throughout the application
 */
class ApiError extends Error {
  /**
   * Create an API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} errors - Additional error details (optional)
   * @param {boolean} isOperational - Whether error is operational (default: true)
   */
  constructor(
    message = 'Internal Server Error',
    statusCode = 500,
    errors = null,
    isOperational = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a Bad Request error (400)
   * @param {string} message - Error message
   * @param {Array} errors - Validation errors
   * @returns {ApiError} Bad request error instance
   */
  static badRequest(message = 'Bad Request', errors = null) {
    return new ApiError(message, 400, errors);
  }

  /**
   * Create an Unauthorized error (401)
   * @param {string} message - Error message
   * @returns {ApiError} Unauthorized error instance
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  /**
   * Create a Forbidden error (403)
   * @param {string} message - Error message
   * @returns {ApiError} Forbidden error instance
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  /**
   * Create a Not Found error (404)
   * @param {string} resource - Resource name
   * @returns {ApiError} Not found error instance
   */
  static notFound(resource = 'Resource') {
    return new ApiError(`${resource} not found`, 404);
  }

  /**
   * Create a Conflict error (409)
   * @param {string} message - Error message
   * @returns {ApiError} Conflict error instance
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(message, 409);
  }

  /**
   * Create an Unprocessable Entity error (422)
   * @param {string} message - Error message
   * @param {Array} errors - Validation errors
   * @returns {ApiError} Unprocessable entity error instance
   */
  static unprocessableEntity(message = 'Unprocessable Entity', errors = null) {
    return new ApiError(message, 422, errors);
  }

  /**
   * Create an Internal Server Error (500)
   * @param {string} message - Error message
   * @returns {ApiError} Internal server error instance
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500, null, false);
  }

  /**
   * Create a Database Error
   * @param {string} message - Error message
   * @param {Error} originalError - Original database error
   * @returns {ApiError} Database error instance
   */
  static database(message = 'Database operation failed', originalError = null) {
    const errors = originalError ? [
      {
        type: 'database_error',
        code: originalError.code,
        detail: originalError.detail || originalError.message,
      }
    ] : null;
    
    return new ApiError(message, 500, errors, false);
  }

  /**
   * Create a Validation Error from express-validator results
   * @param {Array} validationResults - express-validator error array
   * @returns {ApiError} Validation error instance
   */
  static fromValidationResults(validationResults) {
    const errors = validationResults.map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return new ApiError('Validation failed', 400, errors);
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation of the error
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

module.exports = ApiError;