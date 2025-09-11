const express = require('express');
const ExpenseNameController = require('../controllers/ExpenseNameController');
const { 
  expenseNameValidation, 
  paramValidation, 
  queryValidation,
  handleValidationErrors,
  sanitizeBody 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Expense Name routes
 * 
 * All routes for expense name management operations
 * Includes validation and error handling
 */

// GET /api/expense-names - Get all expense names
router.get('/',
  asyncHandler(ExpenseNameController.getAllExpenseNames)
);

// GET /api/expense-names/stats - Get expense names with statistics
router.get('/stats',
  asyncHandler(ExpenseNameController.getExpenseNamesWithStats)
);

// GET /api/expense-names/search - Search expense names
router.get('/search',
  queryValidation.search,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.searchExpenseNames)
);

// GET /api/expense-names/popular - Get popular expense names
router.get('/popular',
  queryValidation.limit,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getPopularExpenseNames)
);

// GET /api/expense-names/recent - Get recently used expense names
router.get('/recent',
  queryValidation.limit,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getRecentlyUsedExpenseNames)
);

// GET /api/expense-names/by-category/:categoryId - Get expense names by category
router.get('/by-category/:categoryId',
  paramValidation.categoryId,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getExpenseNamesByCategory)
);

// GET /api/expense-names/suggestions/:categoryId - Get suggested expense names for category
router.get('/suggestions/:categoryId',
  paramValidation.categoryId,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getSuggestedExpenseNamesForCategory)
);

// GET /api/expense-names/:id - Get expense name by ID
router.get('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getExpenseNameById)
);

// GET /api/expense-names/:id/usage - Get expense name usage statistics
router.get('/:id/usage',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.getExpenseNameUsage)
);

// POST /api/expense-names - Create new expense name
router.post('/',
  sanitizeBody(['nombre', 'categoria_sugerida_id']),
  expenseNameValidation.create,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.createExpenseName)
);

// PUT /api/expense-names/:id - Update expense name
router.put('/:id',
  paramValidation.id,
  sanitizeBody(['nombre', 'categoria_sugerida_id']),
  expenseNameValidation.update,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.updateExpenseName)
);

// DELETE /api/expense-names/:id - Delete expense name
router.delete('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(ExpenseNameController.deleteExpenseName)
);

module.exports = router;