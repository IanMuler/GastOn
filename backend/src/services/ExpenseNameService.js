const ExpenseName = require('../models/ExpenseName');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/**
 * ExpenseNameService - Business logic for expense name operations
 * 
 * Handles expense name-related business rules and operations
 * Separates business logic from controllers
 */
class ExpenseNameService {
  
  /**
   * Get all expense names
   * @returns {Array} List of all expense names
   */
  async getAllExpenseNames() {
    return await ExpenseName.findAll();
  }

  /**
   * Get all expense names with category details
   * @returns {Array} List of expense names with category information
   */
  async getAllExpenseNamesWithCategories() {
    return await ExpenseName.findWithCategories();
  }

  /**
   * Get expense name by ID
   * @param {number} id - Expense name ID
   * @returns {Object} Expense name data
   * @throws {ApiError} If expense name not found
   */
  async getExpenseNameById(id) {
    const expenseName = await ExpenseName.findById(id);
    
    if (!expenseName) {
      throw ApiError.notFound('Expense name');
    }
    
    return expenseName;
  }

  /**
   * Get expense names by category
   * @param {number} categoryId - Category ID
   * @returns {Array} Expense names for the category
   */
  async getExpenseNamesByCategory(categoryId) {
    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw ApiError.notFound('Category');
    }
    
    return await ExpenseName.findByCategory(categoryId);
  }

  /**
   * Create a new expense name
   * @param {Object} expenseNameData - Expense name data
   * @param {string} expenseNameData.nombre - Expense name
   * @param {number} expenseNameData.categoria_sugerida_id - Suggested category ID (optional)
   * @returns {Object} Created expense name
   * @throws {ApiError} If validation fails or name already exists
   */
  async createExpenseName(expenseNameData) {
    // Validate data structure
    this.validateExpenseNameData(expenseNameData);
    
    // Check for duplicate name
    await this.validateUniqueNameForCreate(expenseNameData.nombre);
    
    // Validate suggested category if provided
    if (expenseNameData.categoria_sugerida_id) {
      await this.validateSuggestedCategory(expenseNameData.categoria_sugerida_id);
    }
    
    // Apply business rules
    const processedData = this.applyBusinessRules(expenseNameData);
    
    return await ExpenseName.create(processedData);
  }

  /**
   * Update an existing expense name
   * @param {number} id - Expense name ID
   * @param {Object} expenseNameData - Updated expense name data
   * @returns {Object} Updated expense name
   * @throws {ApiError} If expense name not found or validation fails
   */
  async updateExpenseName(id, expenseNameData) {
    // Check if expense name exists
    await this.getExpenseNameById(id);
    
    // Validate data structure
    this.validateExpenseNameData(expenseNameData);
    
    // Check for duplicate name (excluding current expense name)
    if (expenseNameData.nombre) {
      await this.validateUniqueNameForUpdate(expenseNameData.nombre, id);
    }
    
    // Validate suggested category if provided
    if (expenseNameData.categoria_sugerida_id) {
      await this.validateSuggestedCategory(expenseNameData.categoria_sugerida_id);
    }
    
    // Apply business rules
    const processedData = this.applyBusinessRules(expenseNameData);
    
    const updatedExpenseName = await ExpenseName.update(id, processedData);
    
    if (!updatedExpenseName) {
      throw ApiError.notFound('Expense name');
    }
    
    return updatedExpenseName;
  }

  /**
   * Delete an expense name
   * @param {number} id - Expense name ID
   * @returns {boolean} True if deleted successfully
   * @throws {ApiError} If expense name not found or has dependencies
   */
  async deleteExpenseName(id) {
    // Check if expense name exists
    await this.getExpenseNameById(id);
    
    // Validate deletion is allowed
    await this.validateDeletion(id);
    
    const deleted = await ExpenseName.delete(id);
    
    if (!deleted) {
      throw ApiError.notFound('Expense name');
    }
    
    return true;
  }

  /**
   * Get expense names with usage statistics
   * @returns {Array} Expense names with usage counts
   */
  async getExpenseNamesWithStats() {
    return await ExpenseName.findWithUsageCount();
  }

  /**
   * Search expense names
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Array} Matching expense names
   */
  async searchExpenseNames(searchTerm, limit = 10) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await ExpenseName.findAll({ limit });
    }
    
    return await ExpenseName.search(searchTerm.trim(), limit);
  }

  /**
   * Get expense name usage statistics
   * @param {number} id - Expense name ID
   * @returns {Object} Usage statistics
   */
  async getExpenseNameUsage(id) {
    // Check if expense name exists
    const expenseName = await this.getExpenseNameById(id);
    
    // Get usage count
    const usageCount = await ExpenseName.getUsageCount(id);
    
    return {
      expenseName,
      usageCount,
      canDelete: usageCount === 0
    };
  }

  /**
   * Get popular expense names (most used)
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Array} Popular expense names
   */
  async getPopularExpenseNames(limit = 10) {
    const expenseNamesWithStats = await ExpenseName.findWithUsageCount();
    
    return expenseNamesWithStats
      .filter(item => item.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  }

  /**
   * Get recently used expense names
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Array} Recently used expense names
   */
  async getRecentlyUsedExpenseNames(limit = 10) {
    const expenseNamesWithStats = await ExpenseName.findWithUsageCount();
    
    return expenseNamesWithStats
      .filter(item => item.last_used)
      .sort((a, b) => new Date(b.last_used) - new Date(a.last_used))
      .slice(0, limit);
  }

  // Private validation methods

  /**
   * Validate unique name for creation
   * @param {string} nombre - Expense name
   * @throws {ApiError} If name already exists
   */
  async validateUniqueNameForCreate(nombre) {
    const existingExpenseName = await ExpenseName.findByName(nombre);
    
    if (existingExpenseName) {
      throw ApiError.conflict(`Expense name '${nombre}' already exists`);
    }
  }

  /**
   * Validate unique name for update
   * @param {string} nombre - Expense name
   * @param {number} excludeId - ID to exclude from check
   * @throws {ApiError} If name already exists
   */
  async validateUniqueNameForUpdate(nombre, excludeId) {
    const nameExists = await ExpenseName.nameExists(nombre, excludeId);
    
    if (nameExists) {
      throw ApiError.conflict(`Expense name '${nombre}' already exists`);
    }
  }

  /**
   * Validate suggested category exists
   * @param {number} categoryId - Category ID
   * @throws {ApiError} If category doesn't exist
   */
  async validateSuggestedCategory(categoryId) {
    const category = await Category.findById(categoryId);
    
    if (!category) {
      throw ApiError.badRequest('Suggested category does not exist');
    }
  }

  /**
   * Validate that an expense name can be deleted
   * @param {number} id - Expense name ID
   * @throws {ApiError} If expense name has dependencies
   */
  async validateDeletion(id) {
    const usageCount = await ExpenseName.getUsageCount(id);
    
    if (usageCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete expense name: it is used in ${usageCount} expense(s). ` +
        'Please reassign or delete the expenses first.'
      );
    }
  }

  /**
   * Apply business rules to expense name data
   * @param {Object} expenseNameData - Expense name data
   * @returns {Object} Processed expense name data
   */
  applyBusinessRules(expenseNameData) {
    const processed = { ...expenseNameData };
    
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
   * Validate expense name data structure
   * @param {Object} expenseNameData - Expense name data to validate
   * @throws {ApiError} If data structure is invalid
   */
  validateExpenseNameData(expenseNameData) {
    if (!expenseNameData || typeof expenseNameData !== 'object') {
      throw ApiError.badRequest('Expense name data must be an object');
    }

    // Check for unexpected fields
    const allowedFields = ['nombre', 'categoria_sugerida_id'];
    const providedFields = Object.keys(expenseNameData);
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

  /**
   * Get suggested expense names based on category
   * @param {number} categoryId - Category ID
   * @returns {Array} Suggested expense names for the category
   */
  async getSuggestedExpenseNamesForCategory(categoryId) {
    // Verify category exists
    await this.validateSuggestedCategory(categoryId);
    
    // Get expense names that suggest this category
    const suggestedNames = await ExpenseName.findByCategory(categoryId);
    
    // Also get popular names from this category (if they have usage data)
    const allNamesWithStats = await ExpenseName.findWithUsageCount();
    const popularInCategory = allNamesWithStats
      .filter(item => item.categoria_sugerida_id === categoryId && item.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);
    
    return {
      suggested: suggestedNames,
      popular: popularInCategory
    };
  }
}

// Create and export singleton instance
module.exports = new ExpenseNameService();