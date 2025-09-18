const Expense = require('../models/Expense');
const Category = require('../models/Category');
const ExpenseName = require('../models/ExpenseName');
const ApiError = require('../utils/ApiError');
const { getCurrentWeekDates, getWeekDates, formatDateToString } = require('../utils/dateHelpers');

/**
 * ExpenseService - Business logic for expense operations
 * 
 * Handles expense-related business rules and operations
 * Separates business logic from controllers
 */
class ExpenseService {

  /**
   * Get expenses for a week with offset from current week
   * @param {number} offset - Week offset (0 = current, -1 = previous, +1 = next)
   * @returns {Object} Weekly expense data
   */
  async getWeeklyExpensesByOffset(offset = 0) {
    // Calculate target date based on offset
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (offset * 7));
    
    const targetDateString = formatDateToString(targetDate);
    return await Expense.findWeeklyExpenses(targetDateString);
  }

  /**
   * Get expenses for the current week
   * @returns {Object} Weekly expense data
   */
  async getCurrentWeekExpenses() {
    const today = formatDateToString(new Date());
    return await Expense.findWeeklyExpenses(today);
  }

  /**
   * Get expenses for a specific week
   * @param {string} dateInWeek - Any date within the desired week (YYYY-MM-DD)
   * @returns {Object} Weekly expense data organized by day
   */
  async getWeeklyExpenses(dateInWeek) {
    // Validate date format
    if (!this.isValidDateString(dateInWeek)) {
      throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD');
    }

    return await Expense.findWeeklyExpenses(dateInWeek);
  }

  /**
   * Get expense by ID
   * @param {number} id - Expense ID
   * @returns {Object} Expense with details
   * @throws {ApiError} If expense not found
   */
  async getExpenseById(id) {
    const expense = await Expense.findByIdWithDetails(id);
    
    if (!expense) {
      throw ApiError.notFound('Expense');
    }
    
    return expense;
  }

  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @param {number} expenseData.monto - Amount
   * @param {string} expenseData.fecha - Date (YYYY-MM-DD) (optional, defaults to today)
   * @param {number} expenseData.categoria_id - Category ID
   * @param {number} expenseData.nombre_gasto_id - Expense name ID
   * @param {string} expenseData.descripcion - Description (optional)
   * @returns {Object} Created expense with details
   */
  async createExpense(expenseData) {
    // Validate data structure
    this.validateExpenseData(expenseData);
    
    // Set default date if not provided
    const processedData = this.applyBusinessRules(expenseData);
    
    // Validate related entities exist
    await this.validateRelatedEntities(processedData);
    
    // Apply additional business validations
    await this.validateBusinessRules(processedData);
    
    return await Expense.create(processedData);
  }

  /**
   * Update an existing expense
   * @param {number} id - Expense ID
   * @param {Object} expenseData - Updated expense data
   * @returns {Object} Updated expense with details
   * @throws {ApiError} If expense not found or validation fails
   */
  async updateExpense(id, expenseData) {
    // Check if expense exists
    await this.getExpenseById(id);
    
    // Validate data structure
    this.validateExpenseData(expenseData);
    
    // Apply business rules
    const processedData = this.applyBusinessRules(expenseData);
    
    // Validate related entities if they're being updated
    await this.validateRelatedEntities(processedData);
    
    // Apply additional business validations
    await this.validateBusinessRules(processedData);
    
    const updatedExpense = await Expense.update(id, processedData);
    
    if (!updatedExpense) {
      throw ApiError.notFound('Expense');
    }
    
    return updatedExpense;
  }

  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {boolean} True if deleted successfully
   * @throws {ApiError} If expense not found
   */
  async deleteExpense(id) {
    // Check if expense exists
    await this.getExpenseById(id);
    
    const deleted = await Expense.delete(id);
    
    if (!deleted) {
      throw ApiError.notFound('Expense');
    }
    
    return true;
  }

  /**
   * Get expenses within a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} options - Query options
   * @param {number} options.categoryId - Filter by category ID
   * @param {number} options.page - Page number for pagination (default: 1)
   * @param {number} options.limit - Results per page (default: 50)
   * @returns {Object} Expenses with pagination metadata
   */
  async getExpensesByDateRange(startDate, endDate, options = {}) {
    // Validate dates
    if (!this.isValidDateString(startDate) || !this.isValidDateString(endDate)) {
      throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD');
    }

    // Set up pagination
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 50));
    const offset = (page - 1) * limit;

    // Prepare query options
    const queryOptions = {
      limit,
      offset,
      categoryId: options.categoryId ? parseInt(options.categoryId) : null,
    };

    // Get expenses
    const expenses = await Expense.findByDateRange(startDate, endDate, queryOptions);
    
    // Get total count for pagination (simplified - in production you'd want a separate count query)
    const stats = await Expense.getStatistics(startDate, endDate);
    const total = stats.totalExpenses;

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + expenses.length < total,
      },
      summary: {
        totalAmount: stats.totalAmount,
        averageAmount: stats.averageAmount,
        dateRange: { startDate, endDate },
      },
    };
  }

  /**
   * Get expense statistics for a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Object} Expense statistics
   */
  async getExpenseStatistics(startDate, endDate) {
    // Validate dates
    if (!this.isValidDateString(startDate) || !this.isValidDateString(endDate)) {
      throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD');
    }

    const [stats, categoryBreakdown] = await Promise.all([
      Expense.getStatistics(startDate, endDate),
      Expense.getByCategory(startDate, endDate),
    ]);

    return {
      ...stats,
      categoryBreakdown,
    };
  }

  /**
   * Get monthly expense summary
   * @param {string} month - Month in YYYY-MM format (optional, defaults to current month)
   * @returns {Object} Monthly expense summary
   */
  async getMonthlyExpenses(month) {
    let startDate, endDate;

    if (month) {
      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw ApiError.badRequest('Invalid month format. Use YYYY-MM');
      }
      
      const [year, monthNum] = month.split('-');
      startDate = `${year}-${monthNum}-01`;
      
      // Get last day of month
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`;
    } else {
      // Current month
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
      
      startDate = `${year}-${monthNum}-01`;
      endDate = `${year}-${monthNum}-${new Date(year, now.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}`;
    }

    return await this.getExpenseStatistics(startDate, endDate);
  }

  /**
   * Get recent expenses
   * @param {number} limit - Number of recent expenses (default: 10)
   * @returns {Array} Recent expenses
   */
  async getRecentExpenses(limit = 10) {
    const endDate = formatDateToString(new Date());
    const startDate = formatDateToString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago

    const result = await this.getExpensesByDateRange(startDate, endDate, { limit });
    return result.expenses;
  }

  /**
   * Bulk delete expenses
   * @param {Array<number>} ids - Array of expense IDs
   * @returns {Object} Deletion results
   */
  async bulkDeleteExpenses(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw ApiError.badRequest('IDs must be a non-empty array');
    }

    const results = {
      deleted: [],
      notFound: [],
      errors: [],
    };

    for (const id of ids) {
      try {
        const deleted = await this.deleteExpense(id);
        if (deleted) {
          results.deleted.push(id);
        } else {
          results.notFound.push(id);
        }
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) {
          results.notFound.push(id);
        } else {
          results.errors.push({ id, error: error.message });
        }
      }
    }

    return results;
  }

  // Private validation and utility methods

  /**
   * Validate expense data structure
   * @param {Object} expenseData - Expense data to validate
   * @throws {ApiError} If data structure is invalid
   */
  validateExpenseData(expenseData) {
    if (!expenseData || typeof expenseData !== 'object') {
      throw ApiError.badRequest('Expense data must be an object');
    }

    // Check for unexpected fields
    const allowedFields = ['monto', 'fecha', 'categoria_id', 'nombre_gasto_id', 'descripcion'];
    const providedFields = Object.keys(expenseData);
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
   * Apply business rules to expense data
   * @param {Object} expenseData - Expense data
   * @returns {Object} Processed expense data
   */
  applyBusinessRules(expenseData) {
    const processed = { ...expenseData };
    
    // Set default date to today if not provided
    if (!processed.fecha) {
      processed.fecha = formatDateToString(new Date());
    }
    
    // Round amount to 2 decimal places
    if (processed.monto !== undefined) {
      processed.monto = Math.round(parseFloat(processed.monto) * 100) / 100;
    }
    
    // Trim description
    if (processed.descripcion && typeof processed.descripcion === 'string') {
      processed.descripcion = processed.descripcion.trim() || null;
    }
    
    return processed;
  }

  /**
   * Validate that related entities exist
   * @param {Object} expenseData - Expense data
   * @throws {ApiError} If related entities don't exist
   */
  async validateRelatedEntities(expenseData) {
    const validations = [];

    // Validate category exists
    if (expenseData.categoria_id !== undefined) {
      validations.push(
        Category.findById(expenseData.categoria_id).then(category => {
          if (!category) {
            throw ApiError.badRequest('Selected category does not exist');
          }
        })
      );
    }

    // Validate expense name exists
    if (expenseData.nombre_gasto_id !== undefined) {
      validations.push(
        ExpenseName.findById(expenseData.nombre_gasto_id).then(expenseName => {
          if (!expenseName) {
            throw ApiError.badRequest('Selected expense name does not exist');
          }
        })
      );
    }

    await Promise.all(validations);
  }

  /**
   * Validate business rules for expenses
   * @param {Object} expenseData - Expense data
   * @throws {ApiError} If business rules are violated
   */
  async validateBusinessRules(expenseData) {
    // Example business rule: Expenses over certain amount might need approval
    if (expenseData.monto > 50000) {
      // For now, just log it. In a real app, you might require special approval
      console.log(`Large expense created: $${expenseData.monto}`);
    }

    // Example: Prevent expenses on future dates beyond tomorrow
    if (expenseData.fecha) {
      const expenseDate = new Date(expenseData.fecha);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (expenseDate > tomorrow) {
        throw ApiError.badRequest('Expenses cannot be created for dates beyond tomorrow');
      }
    }
  }

  /**
   * Check if a string is a valid date in YYYY-MM-DD format
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid
   */
  isValidDateString(dateString) {
    if (typeof dateString !== 'string') return false;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
  }

  /**
   * Get expense summary for dashboard
   * @returns {Object} Dashboard summary data
   */
  async getDashboardSummary() {
    const today = formatDateToString(new Date());
    const currentMonth = today.substring(0, 7); // YYYY-MM
    
    const [weeklyData, monthlyData, recentExpenses] = await Promise.all([
      this.getCurrentWeekExpenses(),
      this.getMonthlyExpenses(currentMonth),
      this.getRecentExpenses(5),
    ]);

    return {
      thisWeek: {
        total: weeklyData.weekTotal,
        expenseCount: weeklyData.totalExpenses,
        dates: { start: weeklyData.weekStart, end: weeklyData.weekEnd },
      },
      thisMonth: {
        total: monthlyData.totalAmount,
        expenseCount: monthlyData.totalExpenses,
        average: monthlyData.averageAmount,
        categoryBreakdown: monthlyData.categoryBreakdown,
      },
      recentExpenses,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Create and export singleton instance
module.exports = new ExpenseService();