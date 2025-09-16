import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Expense,
  ExpenseWithDetails,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpensesResponse,
  WeeklyExpensesResponse,
  DashboardSummary,
  ExpenseStatistics,
  BulkDeleteRequest,
  BulkDeleteResponse,
  HealthCheckResponse
} from '@/types/api';
import {
  fetchHandler,
  postHandler,
  putHandler,
  deleteHandler,
  QueryKeys,
  CustomQueryOptions,
  CustomMutationOptions,
  QueryVariables,
  MutationVariables
} from '@/utils/api';
import type { ApiPaths } from '@/types/api';

// =============================================
// QUERY HOOKS
// =============================================

/**
 * Get expenses for a specific week with offset
 * @param weekOffset - 0 for current week, -1 for previous week, etc.
 */
export function useWeekExpenses(
  weekOffset: number = 0,
  options?: CustomQueryOptions<WeeklyExpensesResponse>
) {
  // For current week (offset 0), use the existing endpoint
  const path = weekOffset === 0 
    ? '/api/expenses/weekly/current' as keyof ApiPaths
    : `/api/expenses/weekly?offset=${weekOffset}` as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenses, 'weekly', weekOffset],
    queryFn: () => fetchHandler<WeeklyExpensesResponse>({
      path,
      error: `Error al obtener los gastos de la semana ${weekOffset === 0 ? 'actual' : weekOffset > 0 ? 'futura' : 'anterior'}`
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
}

/**
 * Get current week expenses (backward compatibility)
 */
export function useCurrentWeekExpenses(
  options?: CustomQueryOptions<WeeklyExpensesResponse>
) {
  return useWeekExpenses(0, options);
}

/**
 * Get weekly expenses for a specific date
 */
export function useWeeklyExpenses(
  date: string, // YYYY-MM-DD
  options?: CustomQueryOptions<WeeklyExpensesResponse>
) {
  const path = '/api/expenses/weekly/{date}' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.weeklyExpenses, date],
    queryFn: () =>
      fetchHandler<WeeklyExpensesResponse>({
        path,
        params: { date },
        error: 'Error al obtener los gastos semanales'
      }),
    ...options
  });
}

/**
 * Get expenses by date range
 */
export function useExpensesByDateRange(
  params: QueryVariables<'getExpensesByDateRange'>,
  options?: CustomQueryOptions<ExpensesResponse>
) {
  const path = '/api/expenses' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenses, params],
    queryFn: () =>
      fetchHandler<ExpensesResponse>({
        path,
        params: params as Record<string, string | number | boolean | undefined>,
        error: 'Error al obtener los gastos por rango de fechas'
      }),
    ...options
  });
}

/**
 * Get expense by ID
 */
export function useExpense(
  id: number,
  options?: CustomQueryOptions<ExpenseWithDetails>
) {
  const path = '/api/expenses/{id}' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expense, id],
    queryFn: () =>
      fetchHandler<ExpenseWithDetails>({
        path,
        params: { id },
        error: 'Error al obtener el gasto'
      }),
    ...options
  });
}

/**
 * Get monthly expenses
 */
export function useMonthlyExpenses(
  month?: string, // YYYY-MM format
  options?: CustomQueryOptions<ExpensesResponse>
) {
  const path = '/api/expenses/monthly' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.monthlyExpenses, month],
    queryFn: () =>
      fetchHandler<ExpensesResponse>({
        path,
        params: month ? { month } : {},
        error: 'Error al obtener los gastos mensuales'
      }),
    ...options
  });
}

/**
 * Get dashboard summary
 */
export function useDashboardSummary(
  options?: CustomQueryOptions<DashboardSummary>
) {
  const path = '/api/expenses/dashboard' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.dashboardSummary],
    queryFn: () =>
      fetchHandler<DashboardSummary>({
        path,
        error: 'Error al obtener el resumen del dashboard'
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Get expense statistics
 */
export function useExpenseStatistics(
  params?: QueryVariables<'getExpenseStatistics'>,
  options?: CustomQueryOptions<ExpenseStatistics>
) {
  const path = '/api/expenses/stats' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseStatistics, params],
    queryFn: () =>
      fetchHandler<ExpenseStatistics>({
        path,
        params,
        error: 'Error al obtener las estadísticas de gastos'
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}

/**
 * Health check endpoint
 */
export function useHealthCheck(
  options?: CustomQueryOptions<HealthCheckResponse>
) {
  const path = '/api/expenses/health' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.healthCheck],
    queryFn: () =>
      fetchHandler<HealthCheckResponse>({
        path,
        error: 'Error al verificar el estado del sistema'
      }),
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry health checks
    ...options
  });
}

// =============================================
// MUTATION HOOKS
// =============================================

/**
 * Create a new expense
 */
export function useCreateExpense(
  options?: CustomMutationOptions<
    ExpenseWithDetails,
    Error,
    MutationVariables<'createExpense'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expenses' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ body }) =>
      postHandler<CreateExpenseRequest, ExpenseWithDetails>({
        path,
        body,
        error: 'Error al crear el gasto'
      }),
    onSuccess: () => {
      // Invalidate all expense-related queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.currentWeekExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.weeklyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.monthlyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.dashboardSummary] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseStatistics] });
      
      // Also invalidate stats for categories and expense names
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
    },
    ...options
  });
}

/**
 * Update an existing expense
 */
export function useUpdateExpense(
  options?: CustomMutationOptions<
    ExpenseWithDetails,
    Error,
    MutationVariables<'updateExpense'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expenses/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params, body }) =>
      putHandler<UpdateExpenseRequest, ExpenseWithDetails>({
        path,
        params,
        body,
        error: 'Error al actualizar el gasto'
      }),
    onSuccess: (updatedExpense, { params }) => {
      // Update specific expense in cache
      queryClient.setQueryData([QueryKeys.expense, params.id], updatedExpense);
      
      // Invalidate expense list queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.currentWeekExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.weeklyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.monthlyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.dashboardSummary] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseStatistics] });
      
      // Also invalidate stats
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
    },
    ...options
  });
}

/**
 * Delete an expense
 */
export function useDeleteExpense(
  options?: CustomMutationOptions<
    { id: number },
    Error,
    { params: { id: number } }
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expenses/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params }) =>
      deleteHandler<{ id: number }>({
        path,
        params,
        error: 'Error al eliminar el gasto'
      }),
    onSuccess: (_, { params }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [QueryKeys.expense, params.id] });
      
      // Invalidate expense list queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.currentWeekExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.weeklyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.monthlyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.dashboardSummary] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseStatistics] });
      
      // Also invalidate stats
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
    },
    ...options
  });
}

/**
 * Bulk delete expenses
 */
export function useBulkDeleteExpenses(
  options?: CustomMutationOptions<
    BulkDeleteResponse,
    Error,
    MutationVariables<'bulkDeleteExpenses'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expenses/bulk' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ body }) =>
      deleteHandler<BulkDeleteResponse>({
        path,
        body,
        error: 'Error al eliminar los gastos'
      }),
    onSuccess: (result) => {
      // Remove all deleted expenses from individual caches
      result.deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: [QueryKeys.expense, id] });
      });
      
      // Invalidate all expense list queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.currentWeekExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.weeklyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.monthlyExpenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.dashboardSummary] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseStatistics] });
      
      // Also invalidate stats
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
    },
    ...options
  });
}