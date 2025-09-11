const CategoryService = require('../services/CategoryService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * CategoryController - Handles HTTP requests for category operations
 * 
 * Thin controller layer that delegates business logic to CategoryService
 * Handles request/response formatting and HTTP status codes
 */
class CategoryController {

  /**
   * Get all categories
   * GET /api/categories
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      
      res.status(200).json(
        ApiResponse.success(categories, 'Categories retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * GET /api/categories/:id
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const categoryId = parseInt(id);
      if (isNaN(categoryId) || categoryId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const category = await CategoryService.getCategoryById(categoryId);
      
      res.status(200).json(
        ApiResponse.success(category, 'Category retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new category
   * POST /api/categories
   */
  async createCategory(req, res, next) {
    try {
      const categoryData = req.body;
      
      const category = await CategoryService.createCategory(categoryData);
      
      res.status(201).json(
        ApiResponse.created(category, 'Category created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a category
   * PUT /api/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      // Validate ID parameter
      const categoryId = parseInt(id);
      if (isNaN(categoryId) || categoryId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const category = await CategoryService.updateCategory(categoryId, categoryData);
      
      res.status(200).json(
        ApiResponse.success(category, 'Category updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a category
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const categoryId = parseInt(id);
      if (isNaN(categoryId) || categoryId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      await CategoryService.deleteCategory(categoryId);
      
      res.status(200).json(
        ApiResponse.success(null, 'Category deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get categories with statistics
   * GET /api/categories/stats
   */
  async getCategoriesWithStats(req, res, next) {
    try {
      const categories = await CategoryService.getCategoriesWithStats();
      
      res.status(200).json(
        ApiResponse.success(categories, 'Categories with statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search categories
   * GET /api/categories/search?q=searchTerm
   */
  async searchCategories(req, res, next) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw ApiError.badRequest('Search term is required');
      }

      const categories = await CategoryService.searchCategories(searchTerm);
      
      res.status(200).json(
        ApiResponse.success(categories, 'Categories search completed successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category usage statistics
   * GET /api/categories/:id/usage
   */
  async getCategoryUsage(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const categoryId = parseInt(id);
      if (isNaN(categoryId) || categoryId <= 0) {
        throw ApiError.badRequest('Invalid category ID');
      }

      const usage = await CategoryService.getCategoryUsage(categoryId);
      
      res.status(200).json(
        ApiResponse.success(usage, 'Category usage statistics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get default colors for categories
   * GET /api/categories/colors
   */
  async getDefaultColors(req, res, next) {
    try {
      const colors = CategoryService.getDefaultColors();
      
      res.status(200).json(
        ApiResponse.success(colors, 'Default colors retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

// Create and export singleton instance
module.exports = new CategoryController();