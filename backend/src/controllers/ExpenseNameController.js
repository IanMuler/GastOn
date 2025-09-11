const ExpenseNameService = require('../services/ExpenseNameService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * ExpenseNameController - Handles HTTP requests for expense name operations
 * 
 * Thin controller layer that delegates business logic to ExpenseNameService
 * Handles request/response formatting and HTTP status codes
 */
class ExpenseNameController {

  /**
   * Get all expense names
   * GET /api/expense-names
   */
  async getAllExpenseNames(req, res, next) {
    try {
      const { include_categories } = req.query;
      
      let expenseNames;
      if (include_categories === 'true') {
        expenseNames = await ExpenseNameService.getAllExpenseNamesWithCategories();
      } else {
        expenseNames = await ExpenseNameService.getAllExpenseNames();
      }
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Expense names retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense name by ID
   * GET /api/expense-names/:id
   */
  async getExpenseNameById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const expenseNameId = parseInt(id);
      if (isNaN(expenseNameId) || expenseNameId <= 0) {
        throw ApiError.badRequest('Invalid expense name ID');
      }

      const expenseName = await ExpenseNameService.getExpenseNameById(expenseNameId);
      
      res.status(200).json(
        ApiResponse.success(expenseName, 'Expense name retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense names by category
   * GET /api/expense-names/by-category/:categoryId
   */
  async getExpenseNamesByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      
      // Validate category ID parameter
      const catId = parseInt(categoryId);
      if (isNaN(catId) || catId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const expenseNames = await ExpenseNameService.getExpenseNamesByCategory(catId);
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Expense names by category retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new expense name
   * POST /api/expense-names
   */
  async createExpenseName(req, res, next) {
    try {
      const expenseNameData = req.body;
      
      const expenseName = await ExpenseNameService.createExpenseName(expenseNameData);
      
      res.status(201).json(
        ApiResponse.created(expenseName, 'Expense name created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an expense name
   * PUT /api/expense-names/:id
   */
  async updateExpenseName(req, res, next) {
    try {
      const { id } = req.params;
      const expenseNameData = req.body;
      
      // Validate ID parameter
      const expenseNameId = parseInt(id);
      if (isNaN(expenseNameId) || expenseNameId <= 0) {
        throw ApiError.badRequest('Invalid expense name ID');
      }

      const expenseName = await ExpenseNameService.updateExpenseName(expenseNameId, expenseNameData);
      
      res.status(200).json(
        ApiResponse.success(expenseName, 'Expense name updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an expense name
   * DELETE /api/expense-names/:id
   */
  async deleteExpenseName(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const expenseNameId = parseInt(id);
      if (isNaN(expenseNameId) || expenseNameId <= 0) {
        throw ApiError.badRequest('Invalid expense name ID');
      }

      await ExpenseNameService.deleteExpenseName(expenseNameId);
      
      res.status(200).json(
        ApiResponse.success(null, 'Expense name deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense names with usage statistics
   * GET /api/expense-names/stats
   */
  async getExpenseNamesWithStats(req, res, next) {
    try {
      const expenseNames = await ExpenseNameService.getExpenseNamesWithStats();
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Expense names with statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search expense names
   * GET /api/expense-names/search?q=searchTerm&limit=10
   */
  async searchExpenseNames(req, res, next) {
    try {
      const { q: searchTerm, limit } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw ApiError.badRequest('Search term is required');
      }

      const searchLimit = limit ? Math.min(50, Math.max(1, parseInt(limit))) : 10;

      const expenseNames = await ExpenseNameService.searchExpenseNames(searchTerm, searchLimit);
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Expense names search completed successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense name usage statistics
   * GET /api/expense-names/:id/usage
   */
  async getExpenseNameUsage(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const expenseNameId = parseInt(id);
      if (isNaN(expenseNameId) || expenseNameId <= 0) {
        throw ApiError.badRequest('Invalid expense name ID');
      }

      const usage = await ExpenseNameService.getExpenseNameUsage(expenseNameId);
      
      res.status(200).json(
        ApiResponse.success(usage, 'Expense name usage statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular expense names
   * GET /api/expense-names/popular?limit=10
   */
  async getPopularExpenseNames(req, res, next) {
    try {
      const { limit } = req.query;
      const popularLimit = limit ? Math.min(50, Math.max(1, parseInt(limit))) : 10;

      const expenseNames = await ExpenseNameService.getPopularExpenseNames(popularLimit);
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Popular expense names retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recently used expense names
   * GET /api/expense-names/recent?limit=10
   */
  async getRecentlyUsedExpenseNames(req, res, next) {
    try {
      const { limit } = req.query;
      const recentLimit = limit ? Math.min(50, Math.max(1, parseInt(limit))) : 10;

      const expenseNames = await ExpenseNameService.getRecentlyUsedExpenseNames(recentLimit);
      
      res.status(200).json(
        ApiResponse.success(expenseNames, 'Recently used expense names retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get suggested expense names for a category
   * GET /api/expense-names/suggestions/:categoryId
   */
  async getSuggestedExpenseNamesForCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      
      // Validate category ID parameter
      const catId = parseInt(categoryId);
      if (isNaN(catId) || catId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const suggestions = await ExpenseNameService.getSuggestedExpenseNamesForCategory(catId);
      
      res.status(200).json(
        ApiResponse.success(suggestions, 'Suggested expense names retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

// Create and export singleton instance
module.exports = new ExpenseNameController();