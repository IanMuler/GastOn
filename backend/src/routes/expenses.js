const express = require('express');
const ExpenseController = require('../controllers/ExpenseController');
const { 
  expenseValidation, 
  paramValidation, 
  queryValidation,
  bulkValidation,
  handleValidationErrors,
  sanitizeBody 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Expense routes
 * 
 * All routes for expense management operations
 * Includes validation and error handling
 */

// GET /api/expenses/weekly?offset=X - Get weekly expenses with offset
router.get('/weekly',
  queryValidation.weekOffset,
  handleValidationErrors,
  asyncHandler(ExpenseController.getWeeklyExpensesByOffset)
);

// GET /api/expenses/weekly/current - Get current week expenses
router.get('/weekly/current',
  asyncHandler(ExpenseController.getCurrentWeekExpenses)
);

// GET /api/expenses/weekly/:date - Get weekly expenses for specific date
router.get('/weekly/:date',
  paramValidation.date,
  handleValidationErrors,
  asyncHandler(ExpenseController.getWeeklyExpenses)
);

// GET /api/expenses/dashboard - Get dashboard summary
router.get('/dashboard',
  asyncHandler(ExpenseController.getDashboardSummary)
);

// GET /api/expenses/recent - Get recent expenses
router.get('/recent',
  queryValidation.limit,
  handleValidationErrors,
  asyncHandler(ExpenseController.getRecentExpenses)
);

// GET /api/expenses/monthly - Get monthly expenses
router.get('/monthly',
  queryValidation.month,
  handleValidationErrors,
  asyncHandler(ExpenseController.getMonthlyExpenses)
);

// GET /api/expenses/stats - Get expense statistics
router.get('/stats',
  queryValidation.dateRange,
  handleValidationErrors,
  asyncHandler(ExpenseController.getExpenseStatistics)
);

// GET /api/expenses/health - Health check endpoint
router.get('/health',
  asyncHandler(ExpenseController.healthCheck)
);

// GET /api/expenses - Get expenses by date range
router.get('/',
  queryValidation.dateRange,
  handleValidationErrors,
  asyncHandler(ExpenseController.getExpensesByDateRange)
);

// GET /api/expenses/:id - Get expense by ID
router.get('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(ExpenseController.getExpenseById)
);

// POST /api/expenses - Create new expense
router.post('/',
  sanitizeBody(['monto', 'fecha', 'categoria_id', 'nombre_gasto_id', 'descripcion']),
  expenseValidation.create,
  handleValidationErrors,
  asyncHandler(ExpenseController.createExpense)
);

// PUT /api/expenses/:id - Update expense
router.put('/:id',
  paramValidation.id,
  sanitizeBody(['monto', 'fecha', 'categoria_id', 'nombre_gasto_id', 'descripcion']),
  expenseValidation.update,
  handleValidationErrors,
  asyncHandler(ExpenseController.updateExpense)
);

// DELETE /api/expenses/bulk - Bulk delete expenses
router.delete('/bulk',
  bulkValidation.delete,
  handleValidationErrors,
  asyncHandler(ExpenseController.bulkDeleteExpenses)
);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id',
  paramValidation.id,
  handleValidationErrors,
  asyncHandler(ExpenseController.deleteExpense)
);

module.exports = router;