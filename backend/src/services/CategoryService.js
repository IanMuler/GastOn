const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/**
 * CategoryService - Business logic for category operations
 * 
 * Handles category-related business rules and operations
 * Separates business logic from controllers
 */
class CategoryService {
  
  /**
   * Get all categories
   * @returns {Array} List of all categories
   */
  async getAllCategories() {
    return await Category.findAll();
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Object} Category data
   * @throws {ApiError} If category not found
   */
  async getCategoryById(id) {
    const category = await Category.findById(id);
    
    if (!category) {
      throw ApiError.notFound('Category');
    }
    
    return category;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.nombre - Category name
   * @param {string} categoryData.color - Category color (hex)
   * @returns {Object} Created category
   * @throws {ApiError} If validation fails or name already exists
   */
  async createCategory(categoryData) {
    // Check for duplicate name
    await this.validateUniqueNameForCreate(categoryData.nombre);
    
    // Apply business rules
    const processedData = this.applyBusinessRules(categoryData);
    
    return await Category.create(processedData);
  }

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Object} Updated category
   * @throws {ApiError} If category not found or validation fails
   */
  async updateCategory(id, categoryData) {
    // Check if category exists
    await this.getCategoryById(id);
    
    // Check for duplicate name (excluding current category)
    if (categoryData.nombre) {
      await this.validateUniqueNameForUpdate(categoryData.nombre, id);
    }
    
    // Apply business rules
    const processedData = this.applyBusinessRules(categoryData);
    
    const updatedCategory = await Category.update(id, processedData);
    
    if (!updatedCategory) {
      throw ApiError.notFound('Category');
    }
    
    return updatedCategory;
  }

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {boolean} True if deleted successfully
   * @throws {ApiError} If category not found or has dependencies
   */
  async deleteCategory(id) {
    // Check if category exists
    await this.getCategoryById(id);
    
    // Validate deletion is allowed
    await this.validateDeletion(id);
    
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      throw ApiError.notFound('Category');
    }
    
    return true;
  }

  /**
   * Get categories with expense statistics
   * @returns {Array} Categories with expense counts
   */
  async getCategoriesWithStats() {
    return await Category.findWithExpenseCount();
  }

  /**
   * Search categories by name
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching categories
   */
  async searchCategories(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await this.getAllCategories();
    }

    // For now, we'll get all categories and filter in memory
    // In a larger app, you'd implement a proper search in the model
    const allCategories = await Category.findAll();
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allCategories.filter(category => 
      category.nombre.toLowerCase().includes(lowerSearchTerm)
    );
  }

  /**
   * Get category usage statistics
   * @param {number} id - Category ID
   * @returns {Object} Usage statistics
   */
  async getCategoryUsage(id) {
    // Check if category exists
    const category = await this.getCategoryById(id);
    
    // Get expense count
    const expenseCount = await Category.getExpenseCount(id);
    
    // Get expense name count
    const expenseNameCount = await Category.getExpenseNameCount(id);
    
    return {
      category,
      expenseCount,
      expenseNameCount,
      canDelete: expenseCount === 0
    };
  }

  // Private validation methods

  /**
   * Validate unique name for creation
   * @param {string} nombre - Category name
   * @throws {ApiError} If name already exists
   */
  async validateUniqueNameForCreate(nombre) {
    const existingCategory = await Category.findByName(nombre);
    
    if (existingCategory) {
      throw ApiError.conflict(`Category '${nombre}' already exists`);
    }
  }

  /**
   * Validate unique name for update
   * @param {string} nombre - Category name
   * @param {number} excludeId - ID to exclude from check
   * @throws {ApiError} If name already exists
   */
  async validateUniqueNameForUpdate(nombre, excludeId) {
    const nameExists = await Category.nameExists(nombre, excludeId);
    
    if (nameExists) {
      throw ApiError.conflict(`Category '${nombre}' already exists`);
    }
  }

  /**
   * Validate that a category can be deleted
   * @param {number} id - Category ID
   * @throws {ApiError} If category has dependencies
   */
  async validateDeletion(id) {
    const expenseCount = await Category.getExpenseCount(id);
    
    if (expenseCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category: it has ${expenseCount} associated expense(s). ` +
        'Please reassign or delete the expenses first.'
      );
    }
  }

  /**
   * Apply business rules to category data
   * @param {Object} categoryData - Category data
   * @returns {Object} Processed category data
   */
  applyBusinessRules(categoryData) {
    const processed = { ...categoryData };
    
    // Normalize color to uppercase if provided
    if (processed.color) {
      processed.color = processed.color.toUpperCase();
    }
    
    // Trim and title case the name if provided
    if (processed.nombre) {
      processed.nombre = this.titleCase(processed.nombre.trim());
    }
    
    return processed;
  }

  /**
   * Convert string to title case
   * @param {string} str - Input string
   * @returns {string} Title case string
   */
  titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Get default category colors
   * @returns {Array} Array of default hex colors
   */
  getDefaultColors() {
    return [
      '#EF4444', // Red - Comida
      '#3B82F6', // Blue - Transporte  
      '#8B5CF6', // Purple - Entretenimiento
      '#10B981', // Green - Salud
      '#F59E0B', // Orange - Hogar
      '#6B7280', // Gray - Otros
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
    ];
  }

  /**
   * Validate category data structure
   * @param {Object} categoryData - Category data to validate
   * @throws {ApiError} If data structure is invalid
   */
  validateCategoryData(categoryData) {
    if (!categoryData || typeof categoryData !== 'object') {
      throw ApiError.badRequest('Category data must be an object');
    }

    // Check for unexpected fields
    const allowedFields = ['nombre', 'color'];
    const providedFields = Object.keys(categoryData);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      throw ApiError.badRequest(
        'Invalid fields provided',
        unexpectedFields.map(field => ({
          field,
          message: `Field '${field}' is not allowed`
        }))
      );
    }
  }
}

// Create and export singleton instance
module.exports = new CategoryService();