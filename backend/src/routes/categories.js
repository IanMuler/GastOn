const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const { 
  categoryValidation, 
  paramValidation, 
  queryValidation,
  handleValidationErrors,
  sanitizeBody 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Category routes
 * 
 * All routes for category management operations
 * Includes validation and error handling
 */

// GET /api/categories - Get all categories
router.get('/',
  asyncHandler(CategoryController.getAllCategories)
);

// GET /api/categories/stats - Get categories with statistics
router.get('/stats',
  asyncHandler(CategoryController.getCategoriesWithStats)
);

// GET /api/categories/search - Search categories
router.get('/search',
  queryValidation.search,
  handleValidationErrors,
  asyncHandler(CategoryController.searchCategories)
);

// GET /api/categories/colors - Get default colors
router.get('/colors',
  asyncHandler(CategoryController.getDefaultColors)
);

// GET /api/categories/:id - Get category by ID
router.get('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(CategoryController.getCategoryById)
);

// GET /api/categories/:id/usage - Get category usage statistics
router.get('/:id/usage',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(CategoryController.getCategoryUsage)
);

// POST /api/categories - Create new category
router.post('/',
  sanitizeBody(['nombre', 'color']),
  categoryValidation.create,
  handleValidationErrors,
  asyncHandler(CategoryController.createCategory)
);

// PUT /api/categories/:id - Update category
router.put('/:id',
  paramValidation.id,
  sanitizeBody(['nombre', 'color']),
  categoryValidation.update,
  handleValidationErrors,
  asyncHandler(CategoryController.updateCategory)
);

// DELETE /api/categories/:id - Delete category
router.delete('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(CategoryController.deleteCategory)
);

module.exports = router;