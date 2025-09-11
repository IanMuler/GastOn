import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoriesResponse,
  CategoriesWithStatsResponse,
  DefaultColorsResponse
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
 * Get all categories with optional pagination and search
 */
export function useCategories(
  params?: QueryVariables<'getAllCategories'>,
  options?: CustomQueryOptions<CategoriesResponse>
) {
  const path = '/api/categories' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.categories, params],
    queryFn: () =>
      fetchHandler<CategoriesResponse>({
        path,
        params,
        error: 'Error al obtener las categorías'
      }),
    ...options
  });
}

/**
 * Get category by ID
 */
export function useCategory(
  id: number,
  options?: CustomQueryOptions<Category>
) {
  const path = '/api/categories/{id}' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.category, id],
    queryFn: () =>
      fetchHandler<Category>({
        path,
        params: { id },
        error: 'Error al obtener la categoría'
      }),
    ...options
  });
}

/**
 * Get categories with usage statistics
 */
export function useCategoriesWithStats(
  options?: CustomQueryOptions<CategoriesWithStatsResponse>
) {
  const path = '/api/categories/stats' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.categoriesStats],
    queryFn: () =>
      fetchHandler<CategoriesWithStatsResponse>({
        path,
        error: 'Error al obtener estadísticas de categorías'
      }),
    ...options
  });
}

/**
 * Search categories
 */
export function useSearchCategories(
  searchQuery: string,
  options?: CustomQueryOptions<CategoriesResponse>
) {
  const path = '/api/categories/search' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.categoriesSearch, searchQuery],
    queryFn: () =>
      fetchHandler<CategoriesResponse>({
        path,
        params: { q: searchQuery },
        error: 'Error al buscar categorías'
      }),
    enabled: searchQuery.length > 0,
    ...options
  });
}

/**
 * Get default colors for categories
 */
export function useDefaultColors(
  options?: CustomQueryOptions<DefaultColorsResponse>
) {
  const path = '/api/categories/colors' as keyof ApiPaths;

  return useQuery({
    queryKey: [QueryKeys.defaultColors],
    queryFn: () =>
      fetchHandler<DefaultColorsResponse>({
        path,
        error: 'Error al obtener los colores por defecto'
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes - colors don't change often
    ...options
  });
}

// =============================================
// MUTATION HOOKS
// =============================================

/**
 * Create a new category
 */
export function useCreateCategory(
  options?: CustomMutationOptions<
    Category,
    Error,
    MutationVariables<'createCategory'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/categories' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ body }) =>
      postHandler<CreateCategoryRequest, Category>({
        path,
        body,
        error: 'Error al crear la categoría'
      }),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categories] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
    },
    ...options
  });
}

/**
 * Update an existing category
 */
export function useUpdateCategory(
  options?: CustomMutationOptions<
    Category,
    Error,
    MutationVariables<'updateCategory'>
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/categories/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params, body }) =>
      putHandler<UpdateCategoryRequest, Category>({
        path,
        params,
        body,
        error: 'Error al actualizar la categoría'
      }),
    onSuccess: (updatedCategory, { params }) => {
      // Update specific category in cache
      queryClient.setQueryData([QueryKeys.category, params.id], updatedCategory);
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categories] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesSearch] });
    },
    ...options
  });
}

/**
 * Delete a category
 */
export function useDeleteCategory(
  options?: CustomMutationOptions<
    { id: number },
    Error,
    { params: { id: number } }
  >
) {
  const queryClient = useQueryClient();
  const path = '/api/categories/{id}' as keyof ApiPaths;

  return useMutation({
    mutationFn: ({ params }) =>
      deleteHandler<{ id: number }>({
        path,
        params,
        error: 'Error al eliminar la categoría'
      }),
    onSuccess: (_, { params }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [QueryKeys.category, params.id] });
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categories] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesStats] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.categoriesSearch] });
      
      // Also invalidate expense-related queries as they depend on categories
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenses] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.expenseNames] });
    },
    ...options
  });
}