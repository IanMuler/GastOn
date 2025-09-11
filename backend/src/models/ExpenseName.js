const BaseModel = require('./base/BaseModel');
const ApiError = require('../utils/ApiError');

/**
 * ExpenseName Model
 * 
 * Handles predefined expense names with optional category suggestions
 * Extends BaseModel for common CRUD operations
 */
class ExpenseName extends BaseModel {
  constructor() {
    super(
      'nombres_gastos', // table name
      ['nombre', 'categoria_sugerida_id'], // fillable fields
      'id' // primary key
    );
  }

  /**
   * Create a new expense name with validation
   * @param {Object} expenseNameData - Expense name data
   * @param {string} expenseNameData.nombre - Expense name
   * @param {number} expenseNameData.categoria_sugerida_id - Suggested category ID (optional)
   * @returns {Object} Created expense name
   */
  async create(expenseNameData) {
    // Validate required fields
    this.validateRequiredFields(expenseNameData, ['nombre']);
    
    // Validate and sanitize data
    const validatedData = await this.validateExpenseNameData(expenseNameData);
    
    return await super.create(validatedData);
  }

  /**
   * Update an existing expense name with validation
   * @param {number} id - Expense name ID
   * @param {Object} expenseNameData - Updated expense name data
   * @returns {Object|null} Updated expense name or null if not found
   */
  async update(id, expenseNameData) {
    // Validate and sanitize data
    const validatedData = await this.validateExpenseNameData(expenseNameData);
    
    return await super.update(id, validatedData);
  }

  /**
   * Find all expense names ordered by name
   * @returns {Array} Array of expense names
   */
  async findAll() {
    return await super.findAll({
      orderBy: 'nombre ASC'
    });
  }

  /**
   * Find expense names with category details
   * @returns {Array} Expense names with category information
   */
  async findWithCategories() {
    try {
      const query = `
        SELECT 
          ng.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color
        FROM ${this.tableName} ng
        LEFT JOIN categorias c ON ng.categoria_sugerida_id = c.id
        ORDER BY ng.nombre ASC
      `;
      
      return await this.customQuery(query);
    } catch (error) {
      throw ApiError.database('Failed to get expense names with categories', error);
    }
  }

  /**
   * Find expense names by category
   * @param {number} categoryId - Category ID
   * @returns {Array} Expense names for the category
   */
  async findByCategory(categoryId) {
    return await super.findAll({
      where: { categoria_sugerida_id: categoryId },
      orderBy: 'nombre ASC'
    });
  }

  /**
   * Find expense name by name (case-insensitive)
   * @param {string} nombre - Expense name
   * @returns {Object|null} Expense name or null if not found
   */
  async findByName(nombre) {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE LOWER(nombre) = LOWER($1)
      `;
      const result = await this.customQuery(query, [nombre]);
      return result[0] || null;
    } catch (error) {
      throw ApiError.database('Failed to find expense name by name', error);
    }
  }

  /**
   * Check if expense name exists (case-insensitive)
   * @param {string} nombre - Expense name
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {boolean} True if name exists, false otherwise
   */
  async nameExists(nombre, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count FROM ${this.tableName} 
        WHERE LOWER(nombre) = LOWER($1)
      `;
      const params = [nombre];

      if (excludeId) {
        query += ` AND id != $2`;
        params.push(excludeId);
      }

      const result = await this.customQuery(query, params);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      throw ApiError.database('Failed to check expense name existence', error);
    }
  }

  /**
   * Get expense names with usage count
   * @returns {Array} Expense names with usage counts
   */
  async findWithUsageCount() {
    try {
      const query = `
        SELECT 
          ng.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          COUNT(g.id) as usage_count,
          MAX(g.fecha) as last_used
        FROM ${this.tableName} ng
        LEFT JOIN categorias c ON ng.categoria_sugerida_id = c.id
        LEFT JOIN gastos g ON ng.id = g.nombre_gasto_id
        GROUP BY ng.id, ng.nombre, ng.categoria_sugerida_id, ng.created_at, ng.updated_at,
                 c.nombre, c.color
        ORDER BY ng.nombre ASC
      `;
      
      return await this.customQuery(query);
    } catch (error) {
      throw ApiError.database('Failed to get expense names with usage count', error);
    }
  }

  /**
   * Delete expense name with dependency check
   * @param {number} id - Expense name ID
   * @returns {boolean} True if deleted successfully
   */
  async delete(id) {
    try {
      // Check if expense name has associated expenses
      const usageCount = await this.getUsageCount(id);
      
      if (usageCount > 0) {
        throw ApiError.badRequest(
          `Cannot delete expense name: it is used in ${usageCount} expense(s). ` +
          'Please reassign or delete the expenses first.'
        );
      }

      return await super.delete(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database('Failed to delete expense name', error);
    }
  }

  /**
   * Get usage count for an expense name
   * @param {number} expenseNameId - Expense name ID
   * @returns {number} Number of times used
   */
  async getUsageCount(expenseNameId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM gastos WHERE nombre_gasto_id = $1';
      const result = await this.customQuery(query, [expenseNameId]);
      return parseInt(result[0].count);
    } catch (error) {
      throw ApiError.database('Failed to get usage count', error);
    }
  }

  /**
   * Search expense names by partial name match
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Array} Matching expense names
   */
  async search(searchTerm, limit = 10) {
    try {
      const query = `
        SELECT 
          ng.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color
        FROM ${this.tableName} ng
        LEFT JOIN categorias c ON ng.categoria_sugerida_id = c.id
        WHERE LOWER(ng.nombre) LIKE LOWER($1)
        ORDER BY ng.nombre ASC
        LIMIT $2
      `;
      
      const searchPattern = `%${searchTerm}%`;
      return await this.customQuery(query, [searchPattern, limit]);
    } catch (error) {
      throw ApiError.database('Failed to search expense names', error);
    }
  }

  // Private validation methods

  /**
   * Validate and sanitize expense name data
   * @param {Object} data - Expense name data
   * @returns {Object} Validated data
   */
  async validateExpenseNameData(data) {
    const validated = {};

    // Validate nombre
    if (data.nombre !== undefined) {
      if (typeof data.nombre !== 'string') {
        throw ApiError.badRequest('Expense name must be a string');
      }
      
      const trimmedName = data.nombre.trim();
      if (trimmedName.length === 0) {
        throw ApiError.badRequest('Expense name cannot be empty');
      }
      
      if (trimmedName.length > 200) {
        throw ApiError.badRequest('Expense name cannot exceed 200 characters');
      }
      
      validated.nombre = trimmedName;
    }

    // Validate categoria_sugerida_id
    if (data.categoria_sugerida_id !== undefined) {
      if (data.categoria_sugerida_id === null) {
        validated.categoria_sugerida_id = null;
      } else {
        const categoryId = parseInt(data.categoria_sugerida_id);
        
        if (isNaN(categoryId) || categoryId <= 0) {
          throw ApiError.badRequest('Suggested category ID must be a positive number');
        }
        
        // Verify category exists
        const categoryExists = await this.categoryExists(categoryId);
        if (!categoryExists) {
          throw ApiError.badRequest('Suggested category does not exist');
        }
        
        validated.categoria_sugerida_id = categoryId;
      }
    }

    return validated;
  }

  /**
   * Check if a category exists
   * @param {number} categoryId - Category ID
   * @returns {boolean} True if category exists
   */
  async categoryExists(categoryId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM categorias WHERE id = $1';
      const result = await this.customQuery(query, [categoryId]);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      throw ApiError.database('Failed to check category existence', error);
    }
  }
}

// Create and export singleton instance
module.exports = new ExpenseName();