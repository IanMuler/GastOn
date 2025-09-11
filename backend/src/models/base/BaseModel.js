const db = require('../../config/database');
const ApiError = require('../../utils/ApiError');

/**
 * BaseModel - Abstract base class for all models
 * 
 * Provides common CRUD operations and database interaction patterns
 * Following DRY principle to avoid code duplication across models
 */
class BaseModel {
  /**
   * Constructor for BaseModel
   * @param {string} tableName - Database table name
   * @param {Array<string>} fillableFields - Fields that can be mass assigned
   * @param {string} primaryKey - Primary key field name (default: 'id')
   */
  constructor(tableName, fillableFields = [], primaryKey = 'id') {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is an abstract class and cannot be instantiated directly');
    }
    
    this.tableName = tableName;
    this.fillableFields = fillableFields;
    this.primaryKey = primaryKey;
    this.timestamps = ['created_at', 'updated_at'];
  }

  /**
   * Find all records with optional filtering and ordering
   * @param {Object} options - Query options
   * @param {Object} options.where - WHERE conditions
   * @param {string} options.orderBy - ORDER BY clause
   * @param {number} options.limit - LIMIT clause
   * @param {number} options.offset - OFFSET clause
   * @returns {Array} Array of records
   */
  async findAll(options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];
      let paramIndex = 1;

      // Add WHERE clause
      if (options.where && Object.keys(options.where).length > 0) {
        const whereConditions = Object.keys(options.where).map(key => {
          params.push(options.where[key]);
          return `${key} = $${paramIndex++}`;
        });
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      // Add ORDER BY clause
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      } else {
        query += ` ORDER BY ${this.primaryKey} ASC`;
      }

      // Add LIMIT and OFFSET
      if (options.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(options.limit);
        
        if (options.offset) {
          query += ` OFFSET $${paramIndex++}`;
          params.push(options.offset);
        }
      }

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw ApiError.database(`Failed to fetch ${this.tableName}`, error);
    }
  }

  /**
   * Find a record by primary key
   * @param {number} id - Primary key value
   * @returns {Object|null} Record or null if not found
   */
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw ApiError.database(`Failed to find ${this.tableName} by ID`, error);
    }
  }

  /**
   * Find a single record by conditions
   * @param {Object} conditions - WHERE conditions
   * @returns {Object|null} Record or null if not found
   */
  async findOne(conditions) {
    try {
      const whereConditions = Object.keys(conditions).map((key, index) => 
        `${key} = $${index + 1}`
      );
      const query = `SELECT * FROM ${this.tableName} WHERE ${whereConditions.join(' AND ')} LIMIT 1`;
      const values = Object.values(conditions);
      
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw ApiError.database(`Failed to find ${this.tableName}`, error);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Object} Created record
   */
  async create(data) {
    try {
      // Filter data to only include fillable fields
      const filteredData = this.filterFillableFields(data);
      
      // Add timestamps
      filteredData.created_at = new Date().toISOString();
      filteredData.updated_at = new Date().toISOString();

      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const placeholders = fields.map((_, index) => `$${index + 1}`);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}) 
        VALUES (${placeholders.join(', ')}) 
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        const field = this.extractUniqueConstraintField(error.detail);
        throw ApiError.conflict(`${field} already exists`);
      }
      
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        throw ApiError.badRequest('Referenced resource does not exist');
      }

      throw ApiError.database(`Failed to create ${this.tableName}`, error);
    }
  }

  /**
   * Update a record by primary key
   * @param {number} id - Primary key value
   * @param {Object} data - Updated data
   * @returns {Object|null} Updated record or null if not found
   */
  async update(id, data) {
    try {
      // Check if record exists
      const existingRecord = await this.findById(id);
      if (!existingRecord) {
        return null;
      }

      // Filter data to only include fillable fields
      const filteredData = this.filterFillableFields(data);
      
      // Add updated timestamp
      filteredData.updated_at = new Date().toISOString();

      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`);

      const query = `
        UPDATE ${this.tableName} 
        SET ${setClause.join(', ')} 
        WHERE ${this.primaryKey} = $1 
        RETURNING *
      `;

      const result = await db.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        const field = this.extractUniqueConstraintField(error.detail);
        throw ApiError.conflict(`${field} already exists`);
      }
      
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        throw ApiError.badRequest('Referenced resource does not exist');
      }

      throw ApiError.database(`Failed to update ${this.tableName}`, error);
    }
  }

  /**
   * Delete a record by primary key
   * @param {number} id - Primary key value
   * @returns {boolean} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING ${this.primaryKey}`;
      const result = await db.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      // Handle foreign key constraint violations (cascade restrictions)
      if (error.code === '23503') {
        throw ApiError.badRequest('Cannot delete: resource is referenced by other records');
      }

      throw ApiError.database(`Failed to delete ${this.tableName}`, error);
    }
  }

  /**
   * Count records with optional conditions
   * @param {Object} conditions - WHERE conditions
   * @returns {number} Count of records
   */
  async count(conditions = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params = [];

      if (Object.keys(conditions).length > 0) {
        const whereConditions = Object.keys(conditions).map((key, index) => 
          `${key} = $${index + 1}`
        );
        query += ` WHERE ${whereConditions.join(' AND ')}`;
        params.push(...Object.values(conditions));
      }

      const result = await db.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw ApiError.database(`Failed to count ${this.tableName}`, error);
    }
  }

  /**
   * Check if a record exists
   * @param {Object} conditions - WHERE conditions
   * @returns {boolean} True if exists, false otherwise
   */
  async exists(conditions) {
    try {
      const count = await this.count(conditions);
      return count > 0;
    } catch (error) {
      throw ApiError.database(`Failed to check existence in ${this.tableName}`, error);
    }
  }

  /**
   * Execute a custom query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Array} Query results
   */
  async customQuery(query, params = []) {
    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw ApiError.database('Custom query failed', error);
    }
  }

  // Private helper methods

  /**
   * Filter data to only include fillable fields
   * @param {Object} data - Input data
   * @returns {Object} Filtered data
   */
  filterFillableFields(data) {
    const filtered = {};
    
    for (const field of this.fillableFields) {
      if (data.hasOwnProperty(field) && data[field] !== undefined) {
        filtered[field] = data[field];
      }
    }
    
    return filtered;
  }

  /**
   * Extract field name from unique constraint error detail
   * @param {string} errorDetail - Error detail string
   * @returns {string} Field name
   */
  extractUniqueConstraintField(errorDetail) {
    if (!errorDetail) return 'Field';
    
    // Extract field name from error detail like "Key (nombre)=(value) already exists."
    const match = errorDetail.match(/Key \(([^)]+)\)/);
    return match ? match[1] : 'Field';
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @throws {ApiError} If validation fails
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => 
      !data.hasOwnProperty(field) || 
      data[field] === null || 
      data[field] === undefined || 
      (typeof data[field] === 'string' && data[field].trim() === '')
    );

    if (missingFields.length > 0) {
      throw ApiError.badRequest(
        'Required fields are missing',
        missingFields.map(field => ({
          field,
          message: `${field} is required`,
        }))
      );
    }
  }
}

module.exports = BaseModel;