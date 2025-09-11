const ExpenseService = require('../services/ExpenseService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * ExpenseController - Handles HTTP requests for expense operations
 * 
 * Thin controller layer that delegates business logic to ExpenseService
 * Handles request/response formatting and HTTP status codes
 */
class ExpenseController {

  /**
   * Get expenses for the current week
   * GET /api/expenses/weekly/current
   */
  async getCurrentWeekExpenses(req, res, next) {
    try {
      const weeklyData = await ExpenseService.getCurrentWeekExpenses();
      
      res.status(200).json(
        ApiResponse.success(weeklyData, 'Current week expenses retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expenses for a specific week
   * GET /api/expenses/weekly/:date
   */
  async getWeeklyExpenses(req, res, next) {
    try {
      const { date } = req.params;
      
      // Validate date parameter
      if (!date || typeof date !== 'string') {
        throw ApiError.badRequest('Date parameter is required');
      }

      const weeklyData = await ExpenseService.getWeeklyExpenses(date);
      
      res.status(200).json(
        ApiResponse.success(weeklyData, 'Weekly expenses retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:id
   */
  async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const expenseId = parseInt(id);
      if (isNaN(expenseId) || expenseId <= 0) {
        throw ApiError.badRequest('Invalid expense ID');
      }

      const expense = await ExpenseService.getExpenseById(expenseId);
      
      res.status(200).json(
        ApiResponse.success(expense, 'Expense retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new expense
   * POST /api/expenses
   */
  async createExpense(req, res, next) {
    try {
      const expenseData = req.body;
      
      const expense = await ExpenseService.createExpense(expenseData);
      
      res.status(201).json(
        ApiResponse.created(expense, 'Expense created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an expense
   * PUT /api/expenses/:id
   */
  async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const expenseData = req.body;
      
      // Validate ID parameter
      const expenseId = parseInt(id);
      if (isNaN(expenseId) || expenseId <= 0) {
        throw ApiError.badRequest('Invalid expense ID');
      }

      const expense = await ExpenseService.updateExpense(expenseId, expenseData);
      
      res.status(200).json(
        ApiResponse.success(expense, 'Expense updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an expense
   * DELETE /api/expenses/:id
   */
  async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const expenseId = parseInt(id);
      if (isNaN(expenseId) || expenseId <= 0) {
        throw ApiError.badRequest('Invalid expense ID');
      }

      await ExpenseService.deleteExpense(expenseId);
      
      res.status(200).json(
        ApiResponse.success(null, 'Expense deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expenses by date range
   * GET /api/expenses?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD&categoria_id=1&page=1&limit=50
   */
  async getExpensesByDateRange(req, res, next) {
    try {
      const { fecha_inicio, fecha_fin, categoria_id, page, limit } = req.query;
      
      // Validate required parameters
      if (!fecha_inicio || !fecha_fin) {
        throw ApiError.badRequest('fecha_inicio and fecha_fin parameters are required');
      }

      const options = {
        categoryId: categoria_id ? parseInt(categoria_id) : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      };

      // Validate category ID if provided
      if (options.categoryId && (isNaN(options.categoryId) || options.categoryId <= 0)) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const result = await ExpenseService.getExpensesByDateRange(fecha_inicio, fecha_fin, options);
      
      res.status(200).json(
        ApiResponse.success(result, 'Expenses retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense statistics
   * GET /api/expenses/stats?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
   */
  async getExpenseStatistics(req, res, next) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      // Validate required parameters
      if (!fecha_inicio || !fecha_fin) {
        throw ApiError.badRequest('fecha_inicio and fecha_fin parameters are required');
      }

      const statistics = await ExpenseService.getExpenseStatistics(fecha_inicio, fecha_fin);
      
      res.status(200).json(
        ApiResponse.success(statistics, 'Expense statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monthly expenses
   * GET /api/expenses/monthly?month=YYYY-MM
   */
  async getMonthlyExpenses(req, res, next) {
    try {
      const { month } = req.query;
      
      const monthlyData = await ExpenseService.getMonthlyExpenses(month);
      
      res.status(200).json(
        ApiResponse.success(monthlyData, 'Monthly expenses retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent expenses
   * GET /api/expenses/recent?limit=10
   */
  async getRecentExpenses(req, res, next) {
    try {
      const { limit } = req.query;
      const recentLimit = limit ? Math.min(100, Math.max(1, parseInt(limit))) : 10;

      const expenses = await ExpenseService.getRecentExpenses(recentLimit);
      
      res.status(200).json(
        ApiResponse.success(expenses, 'Recent expenses retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard summary
   * GET /api/expenses/dashboard
   */
  async getDashboardSummary(req, res, next) {
    try {
      const summary = await ExpenseService.getDashboardSummary();
      
      res.status(200).json(
        ApiResponse.success(summary, 'Dashboard summary retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk delete expenses
   * DELETE /api/expenses/bulk
   * Body: { ids: [1, 2, 3] }
   */
  async bulkDeleteExpenses(req, res, next) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids)) {
        throw ApiError.badRequest('ids must be an array');
      }

      if (ids.length === 0) {
        throw ApiError.badRequest('ids array cannot be empty');
      }

      if (ids.length > 100) {
        throw ApiError.badRequest('Cannot delete more than 100 expenses at once');
      }

      // Validate all IDs are numbers
      const invalidIds = ids.filter(id => isNaN(parseInt(id)) || parseInt(id) <= 0);
      if (invalidIds.length > 0) {
        throw ApiError.badRequest(`Invalid expense IDs: ${invalidIds.join(', ')}`);
      }

      const results = await ExpenseService.bulkDeleteExpenses(ids.map(id => parseInt(id)));
      
      // Determine response based on results
      let message = 'Bulk delete completed';
      let statusCode = 200;

      if (results.deleted.length === ids.length) {
        message = 'All expenses deleted successfully';
      } else if (results.deleted.length > 0) {
        message = `${results.deleted.length} expenses deleted, ${results.notFound.length + results.errors.length} failed`;
      } else {
        message = 'No expenses were deleted';
        statusCode = 400;
      }

      res.status(statusCode).json(
        ApiResponse.success(results, message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check endpoint for expenses
   * GET /api/expenses/health
   */
  async healthCheck(req, res, next) {
    try {
      // Perform a simple query to check database connectivity
      const summary = await ExpenseService.getDashboardSummary();
      
      res.status(200).json(
        ApiResponse.success({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          dbConnected: true,
          lastWeekExpenses: summary.thisWeek.expenseCount,
        }, 'Expense service is healthy')
      );
    } catch (error) {
      // Return service unavailable but don't crash
      res.status(503).json(
        ApiResponse.error('Expense service is unhealthy', 503, [
          { message: error.message }
        ])
      );
    }
  }
}

// Create and export singleton instance
module.exports = new ExpenseController();