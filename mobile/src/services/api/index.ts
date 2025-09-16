// Re-export all API hooks for convenient importing

// Categories API
export {
  useCategories,
  useCategory,
  useCategoriesWithStats,
  useSearchCategories,
  useDefaultColors,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from './categories';

// Expense Names API
export {
  useExpenseNames,
  useExpenseName,
  useExpenseNamesWithStats,
  useSearchExpenseNames,
  useExpenseNamesByCategory,
  usePopularExpenseNames,
  useRecentExpenseNames,
  useCreateExpenseName,
  useUpdateExpenseName,
  useDeleteExpenseName
} from './expenseNames';

// Expenses API
export {
  useCurrentWeekExpenses,
  useWeekExpenses,
  useWeeklyExpenses,
  useExpensesByDateRange,
  useExpense,
  useMonthlyExpenses,
  useDashboardSummary,
  useExpenseStatistics,
  useHealthCheck,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useBulkDeleteExpenses
} from './expenses';