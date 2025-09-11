import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExpenseName,
  CreateExpenseNameRequest,
  UpdateExpenseNameRequest,
  ExpenseNamesResponse,
  ExpenseNamesWithStatsResponse
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
 * Get all expense names with optional pagination and search
 */
export function useExpenseNames(
  params?: QueryVariables<'getAllExpenseNames'>,
  options?: CustomQueryOptions<ExpenseNamesResponse>
) {
  const path = '/api/expense-names' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseNames, params],
    queryFn: () =>
      fetchHandler<ExpenseNamesResponse>({
        path,
        params,
        error: 'Error al obtener los nombres de gastos'
      }),
    ...options
  });
}

/**
 * Get expense name by ID
 */
export function useExpenseName(
  id: number,
  options?: CustomQueryOptions<ExpenseName>
) {
  const path = '/api/expense-names/{id}' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseName, id],
    queryFn: () =>
      fetchHandler<ExpenseName>({
        path,
        params: { id },
        error: 'Error al obtener el nombre de gasto'
      }),
    ...options
  });
}

/**
 * Get expense names with usage statistics
 */
export function useExpenseNamesWithStats(
  options?: CustomQueryOptions<ExpenseNamesWithStatsResponse>
) {
  const path = '/api/expense-names/stats' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseNamesStats],
    queryFn: () =>
      fetchHandler<ExpenseNamesWithStatsResponse>({
        path,
        error: 'Error al obtener estadísticas de nombres de gastos'
      }),
    ...options
  });
}

/**
 * Search expense names
 */
export function useSearchExpenseNames(
  searchQuery: string,
  options?: CustomQueryOptions<ExpenseNamesResponse>
) {
  const path = '/api/expense-names/search' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseNamesSearch, searchQuery],
    queryFn: () =>
      fetchHandler<ExpenseNamesResponse>({
        path,
        params: { q: searchQuery },
        error: 'Error al buscar nombres de gastos'
      }),
    enabled: searchQuery.length > 0,
    ...options
  });
}

/**
 * Get expense names by category
 */
export function useExpenseNamesByCategory(
  categoryId: number,
  options?: CustomQueryOptions<ExpenseNamesResponse>
) {
  const path = '/api/expense-names/by-category/{categoryId}' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.expenseNamesByCategory, categoryId],
    queryFn: () =>
      fetchHandler<ExpenseNamesResponse>({
        path,
        params: { categoryId },
        error: 'Error al obtener nombres de gastos por categoría'
      }),
    ...options
  });
}

/**
 * Get popular expense names
 */
export function usePopularExpenseNames(
  limit?: number,
  options?: CustomQueryOptions<ExpenseNamesResponse>
) {
  const path = '/api/expense-names/popular' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.popularExpenseNames, limit],
    queryFn: () =>
      fetchHandler<ExpenseNamesResponse>({
        path,
        params: limit ? { limit } : {},
        error: 'Error al obtener nombres de gastos populares'
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes - popular names don't change often
    ...options
  });
}

/**
 * Get recently used expense names
 */
export function useRecentExpenseNames(
  limit?: number,
  options?: CustomQueryOptions<ExpenseNamesResponse>
) {
  const path = '/api/expense-names/recent' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.recentExpenseNames, limit],
    queryFn: () =>
      fetchHandler<ExpenseNamesResponse>({
        path,
        params: limit ? { limit } : {},
        error: 'Error al obtener nombres de gastos recientes'
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

// =============================================
// MUTATION HOOKS
// =============================================

/**
 * Create a new expense name
 */
export function useCreateExpenseName(
  options?: CustomMutationOptions<
    ExpenseName,
    Error,
    MutationVariables<'createExpenseName'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expense-names' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ body }) =>
      postHandler<CreateExpenseNameRequest, ExpenseName>({
        path,
        body,
        error: 'Error al crear el nombre de gasto'
      }),
    onSuccess: (newExpenseName) => {
      // Invalidate expense names queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.popularExpenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
      
      // Invalidate by-category if it has a suggested category
      if (newExpenseName.categoria_sugerida_id) {
        queryClient.invalidateQueries({ 
          queryKey: [QueryKeys.expenseNamesByCategory, newExpenseName.categoria_sugerida_id] 
        });
      }
    },
    ...options
  });
}

/**
 * Update an existing expense name
 */
export function useUpdateExpenseName(
  options?: CustomMutationOptions<
    ExpenseName,
    Error,
    MutationVariables<'updateExpenseName'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expense-names/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params, body }) =>
      putHandler<UpdateExpenseNameRequest, ExpenseName>({
        path,
        params,
        body,
        error: 'Error al actualizar el nombre de gasto'
      }),
    onSuccess: (updatedExpenseName, { params }) => {
      // Update specific expense name in cache
      queryClient.setQueryData([QueryKeys.expenseName, params.id], updatedExpenseName);
      
      // Invalidate expense names queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesSearch] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.popularExpenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
      
      // Invalidate by-category queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesByCategory] });
    },
    ...options
  });
}

/**
 * Delete an expense name
 */
export function useDeleteExpenseName(
  options?: CustomMutationOptions<
    { id: number },
    Error,
    { params: { id: number } }
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/expense-names/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params }) =>
      deleteHandler<{ id: number }>({
        path,
        params,
        error: 'Error al eliminar el nombre de gasto'
      }),
    onSuccess: (_, { params }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [QueryKeys.expenseName, params.id] });
      
      // Invalidate expense names queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesSearch] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.popularExpenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.recentExpenseNames] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNamesByCategory] });
      
      // Also invalidate expense-related queries as they depend on expense names
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
    },
    ...options
  });
}