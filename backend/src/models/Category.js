const BaseModel = require('./base/BaseModel');
const ApiError = require('../utils/ApiError');

/**
 * Category Model
 * 
 * Handles expense categories with color management
 * Extends BaseModel for common CRUD operations
 */
class Category extends BaseModel {
  constructor() {
    super(
      'categorias', // table name
      ['nombre', 'color'], // fillable fields
      'id' // primary key
    );
  }

  /**
   * Create a new category with validation
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.nombre - Category name
   * @param {string} categoryData.color - Hex color code
   * @returns {Object} Created category
   */
  async create(categoryData) {
    // Validate required fields
    this.validateRequiredFields(categoryData, ['nombre']);
    
    // Validate and sanitize data
    const validatedData = this.validateCategoryData(categoryData);
    
    return await super.create(validatedData);
  }

  /**
   * Update an existing category with validation
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Object|null} Updated category or null if not found
   */
  async update(id, categoryData) {
    // Validate and sanitize data
    const validatedData = this.validateCategoryData(categoryData);
    
    return await super.update(id, validatedData);
  }

  /**
   * Find all categories ordered by name
   * @returns {Array} Array of categories
   */
  async findAll() {
    return await super.findAll({
      orderBy: 'nombre ASC'
    });
  }

  /**
   * Find category by name (case-insensitive)
   * @param {string} nombre - Category name
   * @returns {Object|null} Category or null if not found
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
      throw ApiError.database('Failed to find category by name', error);
    }
  }

  /**
   * Check if category name exists (case-insensitive)
   * @param {string} nombre - Category name
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
      throw ApiError.database('Failed to check category name existence', error);
    }
  }

  /**
   * Get categories with expense count
   * @returns {Array} Categories with expense counts
   */
  async findWithExpenseCount() {
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(g.id) as expense_count
        FROM ${this.tableName} c
        LEFT JOIN gastos g ON c.id = g.categoria_id
        GROUP BY c.id, c.nombre, c.color, c.created_at, c.updated_at
        ORDER BY c.nombre ASC
      `;
      
      return await this.customQuery(query);
    } catch (error) {
      throw ApiError.database('Failed to get categories with expense count', error);
    }
  }

  /**
   * Delete category with dependency check
   * @param {number} id - Category ID
   * @returns {boolean} True if deleted successfully
   */
  async delete(id) {
    try {
      // Check if category has associated expenses
      const expenseCount = await this.getExpenseCount(id);
      
      if (expenseCount > 0) {
        throw ApiError.badRequest(
          `Cannot delete category: it has ${expenseCount} associated expense(s). ` +
          'Please reassign or delete the expenses first.'
        );
      }

      // Check if category has associated expense names
      const expenseNameCount = await this.getExpenseNameCount(id);
      
      if (expenseNameCount > 0) {
        // Update expense names to remove the suggested category reference
        await this.removeFromExpenseNames(id);
      }

      return await super.delete(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database('Failed to delete category', error);
    }
  }

  /**
   * Get count of expenses for a category
   * @param {number} categoryId - Category ID
   * @returns {number} Number of expenses
   */
  async getExpenseCount(categoryId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM gastos WHERE categoria_id = $1';
      const result = await this.customQuery(query, [categoryId]);
      return parseInt(result[0].count);
    } catch (error) {
      throw ApiError.database('Failed to get expense count', error);
    }
  }

  /**
   * Get count of expense names suggesting this category
   * @param {number} categoryId - Category ID
   * @returns {number} Number of expense names
   */
  async getExpenseNameCount(categoryId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM nombres_gastos WHERE categoria_sugerida_id = $1';
      const result = await this.customQuery(query, [categoryId]);
      return parseInt(result[0].count);
    } catch (error) {
      throw ApiError.database('Failed to get expense name count', error);
    }
  }

  /**
   * Remove category suggestion from expense names
   * @param {number} categoryId - Category ID
   */
  async removeFromExpenseNames(categoryId) {
    try {
      const query = 'UPDATE nombres_gastos SET categoria_sugerida_id = NULL WHERE categoria_sugerida_id = $1';
      await this.customQuery(query, [categoryId]);
    } catch (error) {
      throw ApiError.database('Failed to remove category from expense names', error);
    }
  }

  // Private validation methods

  /**
   * Validate and sanitize category data
   * @param {Object} data - Category data
   * @returns {Object} Validated data
   */
  validateCategoryData(data) {
    const validated = {};

    // Validate nombre
    if (data.nombre !== undefined) {
      if (typeof data.nombre !== 'string') {
        throw ApiError.badRequest('Category name must be a string');
      }
      
      const trimmedName = data.nombre.trim();
      if (trimmedName.length === 0) {
        throw ApiError.badRequest('Category name cannot be empty');
      }
      
      if (trimmedName.length > 100) {
        throw ApiError.badRequest('Category name cannot exceed 100 characters');
      }
      
      validated.nombre = trimmedName;
    }

    // Validate color
    if (data.color !== undefined) {
      if (typeof data.color !== 'string') {
        throw ApiError.badRequest('Color must be a string');
      }
      
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(data.color)) {
        throw ApiError.badRequest('Color must be a valid hex code (e.g., #FF5733)');
      }
      
      validated.color = data.color.toUpperCase();
    }

    return validated;
  }
}

// Create and export singleton instance
module.exports = new Category();