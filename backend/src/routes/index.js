const express = require('express');
const categoriesRouter = require('./categories');
const expenseNamesRouter = require('./expenseNames');
const expensesRouter = require('./expenses');
const { healthCheck } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Main API routes
 * 
 * Combines all route modules and provides API information
 */

// Health check endpoint
router.get('/health', healthCheck);

// API information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GastOn API',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      expenseNames: '/api/expense-names',
      expenses: '/api/expenses',
      health: '/api/health',
    },
    documentation: {
      categories: {
        'GET /api/categories': 'Get all categories',
        'GET /api/categories/:id': 'Get category by ID',
        'POST /api/categories': 'Create new category',
        'PUT /api/categories/:id': 'Update category',
        'DELETE /api/categories/:id': 'Delete category',
        'GET /api/categories/stats': 'Get categories with statistics',
        'GET /api/categories/search?q=term': 'Search categories',
        'GET /api/categories/colors': 'Get default colors',
      },
      expenseNames: {
        'GET /api/expense-names': 'Get all expense names',
        'GET /api/expense-names/:id': 'Get expense name by ID',
        'POST /api/expense-names': 'Create new expense name',
        'PUT /api/expense-names/:id': 'Update expense name',
        'DELETE /api/expense-names/:id': 'Delete expense name',
        'GET /api/expense-names/by-category/:categoryId': 'Get expense names by category',
        'GET /api/expense-names/search?q=term': 'Search expense names',
        'GET /api/expense-names/popular': 'Get popular expense names',
        'GET /api/expense-names/recent': 'Get recently used expense names',
      },
      expenses: {
        'GET /api/expenses/weekly/current': 'Get current week expenses',
        'GET /api/expenses/weekly/:date': 'Get weekly expenses for specific date',
        'GET /api/expenses': 'Get expenses by date range',
        'GET /api/expenses/:id': 'Get expense by ID',
        'POST /api/expenses': 'Create new expense',
        'PUT /api/expenses/:id': 'Update expense',
        'DELETE /api/expenses/:id': 'Delete expense',
        'DELETE /api/expenses/bulk': 'Bulk delete expenses',
        'GET /api/expenses/dashboard': 'Get dashboard summary',
        'GET /api/expenses/stats': 'Get expense statistics',
        'GET /api/expenses/monthly': 'Get monthly expenses',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/categories', categoriesRouter);
router.use('/expense-names', expenseNamesRouter);
router.use('/expenses', expensesRouter);

module.exports = router;