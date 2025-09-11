const BaseModel = require('./base/BaseModel');
const ApiError = require('../utils/ApiError');
const { getWeekDates, validateDateRange, formatDateToString } = require('../utils/dateHelpers');

/**
 * Expense Model
 * 
 * Handles individual expense records with category and name relationships
 * Extends BaseModel for common CRUD operations
 */
class Expense extends BaseModel {
  constructor() {
    super(
      'gastos', // table name
      ['monto', 'fecha', 'categoria_id', 'nombre_gasto_id', 'descripcion'], // fillable fields
      'id' // primary key
    );
  }

  /**
   * Create a new expense with validation
   * @param {Object} expenseData - Expense data
   * @param {number} expenseData.monto - Expense amount
   * @param {string} expenseData.fecha - Expense date (YYYY-MM-DD)
   * @param {number} expenseData.categoria_id - Category ID
   * @param {number} expenseData.nombre_gasto_id - Expense name ID
   * @param {string} expenseData.descripcion - Optional description
   * @returns {Object} Created expense with details
   */
  async create(expenseData) {
    // Validate required fields
    this.validateRequiredFields(expenseData, ['monto', 'categoria_id', 'nombre_gasto_id']);
    
    // Validate and sanitize data
    const validatedData = await this.validateExpenseData(expenseData);
    
    // Create the expense
    const expense = await super.create(validatedData);
    
    // Return with full details
    return await this.findByIdWithDetails(expense.id);
  }

  /**
   * Update an existing expense with validation
   * @param {number} id - Expense ID
   * @param {Object} expenseData - Updated expense data
   * @returns {Object|null} Updated expense with details or null if not found
   */
  async update(id, expenseData) {
    // Validate and sanitize data
    const validatedData = await this.validateExpenseData(expenseData);
    
    // Update the expense
    const expense = await super.update(id, validatedData);
    
    if (!expense) {
      return null;
    }
    
    // Return with full details
    return await this.findByIdWithDetails(expense.id);
  }

  /**
   * Find expense by ID with category and name details
   * @param {number} id - Expense ID
   * @returns {Object|null} Expense with details or null if not found
   */
  async findByIdWithDetails(id) {
    try {
      const query = `
        SELECT 
          g.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          ng.nombre as nombre_gasto
        FROM ${this.tableName} g
        JOIN categorias c ON g.categoria_id = c.id
        JOIN nombres_gastos ng ON g.nombre_gasto_id = ng.id
        WHERE g.id = $1
      `;
      
      const result = await this.customQuery(query, [id]);
      return this.formatExpenseWithDetails(result[0]) || null;
    } catch (error) {
      throw ApiError.database('Failed to find expense with details', error);
    }
  }

  /**
   * Find expenses for a specific week with details
   * @param {string} dateInWeek - Any date within the desired week (YYYY-MM-DD)
   * @returns {Object} Week data with expenses organized by day
   */
  async findWeeklyExpenses(dateInWeek) {
    try {
      const { weekStart, weekEnd, dates } = getWeekDates(dateInWeek);
      
      const query = `
        SELECT 
          g.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          ng.nombre as nombre_gasto
        FROM ${this.tableName} g
        JOIN categorias c ON g.categoria_id = c.id
        JOIN nombres_gastos ng ON g.nombre_gasto_id = ng.id
        WHERE g.fecha >= $1 AND g.fecha <= $2
        ORDER BY g.fecha ASC, g.created_at ASC
      `;
      
      const result = await this.customQuery(query, [weekStart, weekEnd]);
      const expenses = result.map(row => this.formatExpenseWithDetails(row));
      
      // Organize expenses by day
      const expensesByDay = this.organizeExpensesByDay(expenses, dates);
      
      // Calculate totals
      const weekTotal = expenses.reduce((sum, expense) => sum + parseFloat(expense.monto), 0);
      
      return {
        weekStart,
        weekEnd,
        dates,
        expenses: expensesByDay,
        weekTotal,
        totalExpenses: expenses.length
      };
    } catch (error) {
      throw ApiError.database('Failed to get weekly expenses', error);
    }
  }

  /**
   * Find expenses within a date range with details
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} options - Query options
   * @returns {Array} Expenses with details
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      // Validate date range
      const validation = validateDateRange(startDate, endDate);
      if (!validation.isValid) {
        throw ApiError.badRequest('Invalid date range', validation.errors.map(err => ({ message: err })));
      }

      let query = `
        SELECT 
          g.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          ng.nombre as nombre_gasto
        FROM ${this.tableName} g
        JOIN categorias c ON g.categoria_id = c.id
        JOIN nombres_gastos ng ON g.nombre_gasto_id = ng.id
        WHERE g.fecha >= $1 AND g.fecha <= $2
      `;
      
      const params = [startDate, endDate];
      let paramIndex = 3;

      // Add category filter if specified
      if (options.categoryId) {
        query += ` AND g.categoria_id = $${paramIndex++}`;
        params.push(options.categoryId);
      }

      // Add ordering
      query += ` ORDER BY g.fecha DESC, g.created_at DESC`;

      // Add pagination
      if (options.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(options.limit);
        
        if (options.offset) {
          query += ` OFFSET $${paramIndex++}`;
          params.push(options.offset);
        }
      }

      const result = await this.customQuery(query, params);
      return result.map(row => this.formatExpenseWithDetails(row));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database('Failed to get expenses by date range', error);
    }
  }

  /**
   * Get expense statistics for a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Object} Expense statistics
   */
  async getStatistics(startDate, endDate) {
    try {
      const validation = validateDateRange(startDate, endDate);
      if (!validation.isValid) {
        throw ApiError.badRequest('Invalid date range', validation.errors.map(err => ({ message: err })));
      }

      const query = `
        SELECT 
          COUNT(*) as total_expenses,
          SUM(monto) as total_amount,
          AVG(monto) as average_amount,
          MIN(monto) as min_amount,
          MAX(monto) as max_amount,
          COUNT(DISTINCT categoria_id) as categories_used,
          COUNT(DISTINCT nombre_gasto_id) as expense_names_used
        FROM ${this.tableName}
        WHERE fecha >= $1 AND fecha <= $2
      `;

      const result = await this.customQuery(query, [startDate, endDate]);
      const stats = result[0];

      return {
        totalExpenses: parseInt(stats.total_expenses),
        totalAmount: parseFloat(stats.total_amount) || 0,
        averageAmount: parseFloat(stats.average_amount) || 0,
        minAmount: parseFloat(stats.min_amount) || 0,
        maxAmount: parseFloat(stats.max_amount) || 0,
        categoriesUsed: parseInt(stats.categories_used),
        expenseNamesUsed: parseInt(stats.expense_names_used),
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database('Failed to get expense statistics', error);
    }
  }

  /**
   * Get expenses by category for a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Array} Expenses grouped by category
   */
  async getByCategory(startDate, endDate) {
    try {
      const validation = validateDateRange(startDate, endDate);
      if (!validation.isValid) {
        throw ApiError.badRequest('Invalid date range', validation.errors.map(err => ({ message: err })));
      }

      const query = `
        SELECT 
          c.id as categoria_id,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          COUNT(g.id) as expense_count,
          SUM(g.monto) as total_amount,
          AVG(g.monto) as average_amount
        FROM categorias c
        LEFT JOIN ${this.tableName} g ON c.id = g.categoria_id 
          AND g.fecha >= $1 AND g.fecha <= $2
        GROUP BY c.id, c.nombre, c.color
        ORDER BY total_amount DESC NULLS LAST, c.nombre ASC
      `;

      const result = await this.customQuery(query, [startDate, endDate]);
      
      return result.map(row => ({
        categoria: {
          id: row.categoria_id,
          nombre: row.categoria_nombre,
          color: row.categoria_color
        },
        expenseCount: parseInt(row.expense_count),
        totalAmount: parseFloat(row.total_amount) || 0,
        averageAmount: parseFloat(row.average_amount) || 0
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.database('Failed to get expenses by category', error);
    }
  }

  // Private helper methods

  /**
   * Validate and sanitize expense data
   * @param {Object} data - Expense data
   * @returns {Object} Validated data
   */
  async validateExpenseData(data) {
    const validated = {};

    // Validate monto
    if (data.monto !== undefined) {
      const monto = parseFloat(data.monto);
      
      if (isNaN(monto) || monto <= 0) {
        throw ApiError.badRequest('Amount must be a positive number');
      }
      
      if (monto > 99999999.99) {
        throw ApiError.badRequest('Amount cannot exceed 99,999,999.99');
      }
      
      validated.monto = Math.round(monto * 100) / 100; // Round to 2 decimal places
    }

    // Validate fecha
    if (data.fecha !== undefined) {
      if (typeof data.fecha !== 'string') {
        throw ApiError.badRequest('Date must be a string in YYYY-MM-DD format');
      }
      
      try {
        const date = new Date(data.fecha + 'T00:00:00');
        if (isNaN(date)) {
          throw new Error();
        }
        
        // Check if date is not too far in the future
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (date > today) {
          throw ApiError.badRequest('Expense date cannot be in the future');
        }
        
        validated.fecha = formatDateToString(date);
      } catch (error) {
        throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD');
      }
    }

    // Validate categoria_id
    if (data.categoria_id !== undefined) {
      const categoryId = parseInt(data.categoria_id);
      
      if (isNaN(categoryId) || categoryId <= 0) {
        throw ApiError.badRequest('Category ID must be a positive number');
      }
      
      const categoryExists = await this.categoryExists(categoryId);
      if (!categoryExists) {
        throw ApiError.badRequest('Selected category does not exist');
      }
      
      validated.categoria_id = categoryId;
    }

    // Validate nombre_gasto_id
    if (data.nombre_gasto_id !== undefined) {
      const expenseNameId = parseInt(data.nombre_gasto_id);
      
      if (isNaN(expenseNameId) || expenseNameId <= 0) {
        throw ApiError.badRequest('Expense name ID must be a positive number');
      }
      
      const expenseNameExists = await this.expenseNameExists(expenseNameId);
      if (!expenseNameExists) {
        throw ApiError.badRequest('Selected expense name does not exist');
      }
      
      validated.nombre_gasto_id = expenseNameId;
    }

    // Validate descripcion
    if (data.descripcion !== undefined) {
      if (data.descripcion === null) {
        validated.descripcion = null;
      } else if (typeof data.descripcion === 'string') {
        const trimmedDescription = data.descripcion.trim();
        validated.descripcion = trimmedDescription.length > 0 ? trimmedDescription : null;
      } else {
        throw ApiError.badRequest('Description must be a string');
      }
    }

    return validated;
  }

  /**
   * Check if a category exists
   * @param {number} categoryId - Category ID
   * @returns {boolean} True if category exists
   */
  async categoryExists(categoryId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM categorias WHERE id = $1';
      const result = await this.customQuery(query, [categoryId]);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      throw ApiError.database('Failed to check category existence', error);
    }
  }

  /**
   * Check if an expense name exists
   * @param {number} expenseNameId - Expense name ID
   * @returns {boolean} True if expense name exists
   */
  async expenseNameExists(expenseNameId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM nombres_gastos WHERE id = $1';
      const result = await this.customQuery(query, [expenseNameId]);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      throw ApiError.database('Failed to check expense name existence', error);
    }
  }

  /**
   * Format expense data with category and name details
   * @param {Object} row - Database row
   * @returns {Object} Formatted expense
   */
  formatExpenseWithDetails(row) {
    if (!row) return null;

    return {
      id: row.id,
      monto: parseFloat(row.monto),
      fecha: row.fecha,
      descripcion: row.descripcion,
      created_at: row.created_at,
      updated_at: row.updated_at,
      categoria_id: row.categoria_id,
      nombre_gasto_id: row.nombre_gasto_id,
      categoria: {
        id: row.categoria_id,
        nombre: row.categoria_nombre,
        color: row.categoria_color
      },
      nombre_gasto: {
        id: row.nombre_gasto_id,
        nombre: row.nombre_gasto
      }
    };
  }

  /**
   * Organize expenses by day of the week
   * @param {Array} expenses - Array of expenses
   * @param {Array} dates - Array of date strings for the week
   * @returns {Object} Expenses organized by day
   */
  organizeExpensesByDay(expenses, dates) {
    const expensesByDay = {};

    // Initialize each day
    dates.forEach(date => {
      expensesByDay[date] = [];
    });

    // Group expenses by date
    expenses.forEach(expense => {
      if (expensesByDay[expense.fecha]) {
        expensesByDay[expense.fecha].push(expense);
      }
    });

    return expensesByDay;
  }
}

// Create and export singleton instance
module.exports = new Expense();