// API Types Export for Frontend Consumption
// This file exports all types used by the API for frontend integration

// Database Models
export interface Category {
  id: number;
  nombre: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseName {
  id: number;
  nombre: string;
  categoria_sugerida_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  monto: number;
  fecha: string; // YYYY-MM-DD format
  categoria_id: number;
  nombre_gasto_id: number;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced Models with Relationships
export interface ExpenseWithDetails extends Expense {
  categoria: Category;
  nombre_gasto: ExpenseName;
}

export interface CategoryWithStats extends Category {
  total_gastos: number;
  ultimo_uso?: string;
}

export interface ExpenseNameWithStats extends ExpenseName {
  total_usos: number;
  ultimo_uso?: string;
  categoria_sugerida?: Category;
}

// Request Types for Create Operations
export interface CreateCategoryRequest {
  nombre: string;
  color: string;
}

export interface UpdateCategoryRequest {
  nombre?: string;
  color?: string;
}

export interface CreateExpenseNameRequest {
  nombre: string;
  categoria_sugerida_id?: number;
}

export interface UpdateExpenseNameRequest {
  nombre?: string;
  categoria_sugerida_id?: number;
}

export interface CreateExpenseRequest {
  monto: number;
  fecha: string; // YYYY-MM-DD
  categoria_id: number;
  nombre_gasto_id: number;
  descripcion?: string;
}

export interface UpdateExpenseRequest {
  monto?: number;
  fecha?: string; // YYYY-MM-DD
  categoria_id?: number;
  nombre_gasto_id?: number;
  descripcion?: string;
}

// Query Parameters
export interface DateRangeQuery {
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string; // YYYY-MM-DD
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery {
  q?: string;
}

export interface CategoryQuery extends PaginationQuery, SearchQuery {}
export interface ExpenseNameQuery extends PaginationQuery, SearchQuery {
  categoria_id?: number;
}
export interface ExpenseQuery extends PaginationQuery, DateRangeQuery {}

// Response Types for Lists
export type CategoriesResponse = Category[];

export interface CategoriesWithStatsResponse {
  categories: CategoryWithStats[];
  total: number;
}

export type ExpenseNamesResponse = ExpenseName[];

export interface ExpenseNamesWithStatsResponse {
  expenseNames: ExpenseNameWithStats[];
  total: number;
}

export interface ExpensesResponse {
  expenses: ExpenseWithDetails[];
  total: number;
  page: number;
  limit: number;
}

// Weekly Data Types
export interface DayExpenses {
  date: string; // YYYY-MM-DD
  dayName: string;
  expenses: ExpenseWithDetails[];
  totalAmount: number;
}

export interface WeeklyExpensesResponse {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  days: DayExpenses[];
  weekTotal: number;
}

// Dashboard and Statistics
export interface CategoryBalance {
  categoria: Category;
  total: number;
  porcentaje: number;
  cantidad_gastos: number;
}

export interface ExpenseNameBalance {
  nombre: ExpenseName;
  total: number;
  frecuencia: number;
  promedio: number;
}

export interface DashboardSummary {
  totalMes: number;
  totalSemanaActual: number;
  promedoDiario: number;
  cantidadGastos: number;
  categoriasMasUsadas: CategoryBalance[];
  nombresMasUsados: ExpenseNameBalance[];
  gastosPorDia: Array<{
    fecha: string;
    total: number;
  }>;
}

export interface ExpenseStatistics {
  totalPeriodo: number;
  promedioDiario: number;
  categorias: CategoryBalance[];
  nombres: ExpenseNameBalance[];
  gastosPorMes: Array<{
    mes: string; // YYYY-MM
    total: number;
  }>;
}

// Default Colors Response
export interface DefaultColorsResponse {
  colors: string[];
}

// Bulk Operations
export interface BulkDeleteRequest {
  ids: number[];
}

export interface BulkDeleteResponse {
  deletedCount: number;
  deletedIds: number[];
}

// Health Check Response
export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  database: string;
  tablesCount: number;
}

// Error Response Types
export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  timestamp: string;
}

// Success Response Types
export interface ApiResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// API Operation Types (for path extraction)
export interface ApiOperations {
  // Categories
  'getAllCategories': {
    parameters: { query?: CategoryQuery };
    responses: { 200: { content: { '*/*': ApiResponse<CategoriesResponse> } } };
  };
  'getCategoryById': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<Category> } } };
  };
  'createCategory': {
    requestBody: { content: { 'application/json': CreateCategoryRequest } };
    responses: { 201: { content: { '*/*': ApiResponse<Category> } } };
  };
  'updateCategory': {
    parameters: { path: { id: number } };
    requestBody: { content: { 'application/json': UpdateCategoryRequest } };
    responses: { 200: { content: { '*/*': ApiResponse<Category> } } };
  };
  'deleteCategory': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<{ id: number }> } } };
  };
  'getCategoriesWithStats': {
    responses: { 200: { content: { '*/*': ApiResponse<CategoriesWithStatsResponse> } } };
  };
  'searchCategories': {
    parameters: { query: SearchQuery };
    responses: { 200: { content: { '*/*': ApiResponse<CategoriesResponse> } } };
  };
  'getDefaultColors': {
    responses: { 200: { content: { '*/*': ApiResponse<DefaultColorsResponse> } } };
  };

  // Expense Names
  'getAllExpenseNames': {
    parameters: { query?: ExpenseNameQuery };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesResponse> } } };
  };
  'getExpenseNameById': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseName> } } };
  };
  'createExpenseName': {
    requestBody: { content: { 'application/json': CreateExpenseNameRequest } };
    responses: { 201: { content: { '*/*': ApiResponse<ExpenseName> } } };
  };
  'updateExpenseName': {
    parameters: { path: { id: number } };
    requestBody: { content: { 'application/json': UpdateExpenseNameRequest } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseName> } } };
  };
  'deleteExpenseName': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<{ id: number }> } } };
  };
  'getExpenseNamesByCategory': {
    parameters: { path: { categoryId: number } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesResponse> } } };
  };
  'getExpenseNamesWithStats': {
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesWithStatsResponse> } } };
  };
  'searchExpenseNames': {
    parameters: { query: SearchQuery };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesResponse> } } };
  };
  'getPopularExpenseNames': {
    parameters: { query?: { limit?: number } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesResponse> } } };
  };
  'getRecentlyUsedExpenseNames': {
    parameters: { query?: { limit?: number } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseNamesResponse> } } };
  };

  // Expenses
  'getCurrentWeekExpenses': {
    responses: { 200: { content: { '*/*': ApiResponse<WeeklyExpensesResponse> } } };
  };
  'getWeeklyExpenses': {
    parameters: { path: { date: string } };
    responses: { 200: { content: { '*/*': ApiResponse<WeeklyExpensesResponse> } } };
  };
  'getExpensesByDateRange': {
    parameters: { query: DateRangeQuery };
    responses: { 200: { content: { '*/*': ApiResponse<ExpensesResponse> } } };
  };
  'getExpenseById': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseWithDetails> } } };
  };
  'createExpense': {
    requestBody: { content: { 'application/json': CreateExpenseRequest } };
    responses: { 201: { content: { '*/*': ApiResponse<ExpenseWithDetails> } } };
  };
  'updateExpense': {
    parameters: { path: { id: number } };
    requestBody: { content: { 'application/json': UpdateExpenseRequest } };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseWithDetails> } } };
  };
  'deleteExpense': {
    parameters: { path: { id: number } };
    responses: { 200: { content: { '*/*': ApiResponse<{ id: number }> } } };
  };
  'bulkDeleteExpenses': {
    requestBody: { content: { 'application/json': BulkDeleteRequest } };
    responses: { 200: { content: { '*/*': ApiResponse<BulkDeleteResponse> } } };
  };
  'getDashboardSummary': {
    responses: { 200: { content: { '*/*': ApiResponse<DashboardSummary> } } };
  };
  'getExpenseStatistics': {
    parameters: { query?: DateRangeQuery };
    responses: { 200: { content: { '*/*': ApiResponse<ExpenseStatistics> } } };
  };
  'getMonthlyExpenses': {
    parameters: { query?: { month?: string } }; // YYYY-MM
    responses: { 200: { content: { '*/*': ApiResponse<ExpensesResponse> } } };
  };
  'healthCheck': {
    responses: { 200: { content: { '*/*': ApiResponse<HealthCheckResponse> } } };
  };
}

// API Paths mapping
export interface ApiPaths {
  '/api/categories': {
    get: ApiOperations['getAllCategories'];
    post: ApiOperations['createCategory'];
  };
  '/api/categories/{id}': {
    get: ApiOperations['getCategoryById'];
    put: ApiOperations['updateCategory'];
    delete: ApiOperations['deleteCategory'];
  };
  '/api/categories/stats': {
    get: ApiOperations['getCategoriesWithStats'];
  };
  '/api/categories/search': {
    get: ApiOperations['searchCategories'];
  };
  '/api/categories/colors': {
    get: ApiOperations['getDefaultColors'];
  };
  '/api/expense-names': {
    get: ApiOperations['getAllExpenseNames'];
    post: ApiOperations['createExpenseName'];
  };
  '/api/expense-names/{id}': {
    get: ApiOperations['getExpenseNameById'];
    put: ApiOperations['updateExpenseName'];
    delete: ApiOperations['deleteExpenseName'];
  };
  '/api/expense-names/by-category/{categoryId}': {
    get: ApiOperations['getExpenseNamesByCategory'];
  };
  '/api/expense-names/stats': {
    get: ApiOperations['getExpenseNamesWithStats'];
  };
  '/api/expense-names/search': {
    get: ApiOperations['searchExpenseNames'];
  };
  '/api/expense-names/popular': {
    get: ApiOperations['getPopularExpenseNames'];
  };
  '/api/expense-names/recent': {
    get: ApiOperations['getRecentlyUsedExpenseNames'];
  };
  '/api/expenses/weekly/current': {
    get: ApiOperations['getCurrentWeekExpenses'];
  };
  '/api/expenses/weekly/{date}': {
    get: ApiOperations['getWeeklyExpenses'];
  };
  '/api/expenses': {
    get: ApiOperations['getExpensesByDateRange'];
    post: ApiOperations['createExpense'];
  };
  '/api/expenses/{id}': {
    get: ApiOperations['getExpenseById'];
    put: ApiOperations['updateExpense'];
    delete: ApiOperations['deleteExpense'];
  };
  '/api/expenses/bulk': {
    delete: ApiOperations['bulkDeleteExpenses'];
  };
  '/api/expenses/dashboard': {
    get: ApiOperations['getDashboardSummary'];
  };
  '/api/expenses/stats': {
    get: ApiOperations['getExpenseStatistics'];
  };
  '/api/expenses/monthly': {
    get: ApiOperations['getMonthlyExpenses'];
  };
  '/api/expenses/health': {
    get: ApiOperations['healthCheck'];
  };
}