/**
 * ApiResponse - Standardized API response format
 * 
 * Provides consistent response structure across all endpoints
 * Follows REST API best practices for response formatting
 */
class ApiResponse {
  /**
   * Success response with data
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Formatted success response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Array} errors - Detailed error array (optional)
   * @returns {Object} Formatted error response
   */
  static error(message = 'Internal Server Error', statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validation error response
   * @param {Array} validationErrors - Array of validation errors
   * @param {string} message - Error message
   * @returns {Object} Formatted validation error response
   */
  static validationError(validationErrors, message = 'Validation failed') {
    return this.error(message, 400, validationErrors);
  }

  /**
   * Not found error response
   * @param {string} resource - Resource that was not found
   * @returns {Object} Formatted not found response
   */
  static notFound(resource = 'Resource') {
    return this.error(`${resource} not found`, 404);
  }

  /**
   * Unauthorized error response
   * @param {string} message - Custom message
   * @returns {Object} Formatted unauthorized response
   */
  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401);
  }

  /**
   * Forbidden error response
   * @param {string} message - Custom message
   * @returns {Object} Formatted forbidden response
   */
  static forbidden(message = 'Access forbidden') {
    return this.error(message, 403);
  }

  /**
   * Conflict error response (e.g., duplicate resources)
   * @param {string} message - Custom message
   * @returns {Object} Formatted conflict response
   */
  static conflict(message = 'Resource conflict') {
    return this.error(message, 409);
  }

  /**
   * Created response for successful resource creation
   * @param {*} data - Created resource data
   * @param {string} message - Success message
   * @returns {Object} Formatted created response
   */
  static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  /**
   * No content response for successful operations with no return data
   * @param {string} message - Success message
   * @returns {Object} Formatted no content response
   */
  static noContent(message = 'Operation completed successfully') {
    return this.success(null, message, 204);
  }

  /**
   * Paginated response for list endpoints
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = ApiResponse;