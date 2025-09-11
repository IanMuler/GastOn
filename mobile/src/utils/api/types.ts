import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiOperations, ApiPaths } from '@/types/api';

/**
 * Utility type to extract the API path from an operation definition
 * NOTE: Currently simplified to use string literals for paths
 */
export type PathFromOperation<Op> = keyof ApiPaths;

/**
 * Custom query options that omit conflicting TanStack Query keys
 */
export type CustomQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T>,
  'queryKey' | 'queryFn'
>;

/**
 * Custom mutation options for consistent typing
 */
export type CustomMutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;

/**
 * Query keys enum for consistent cache management
 */
export enum QueryKeys {
  // Categories
  categories = 'categories',
  category = 'category',
  categoriesStats = 'categoriesStats',
  categoriesSearch = 'categoriesSearch',
  defaultColors = 'defaultColors',
  
  // Expense Names
  expenseNames = 'expenseNames',
  expenseName = 'expenseName',
  expenseNamesStats = 'expenseNamesStats',
  expenseNamesSearch = 'expenseNamesSearch',
  expenseNamesByCategory = 'expenseNamesByCategory',
  popularExpenseNames = 'popularExpenseNames',
  recentExpenseNames = 'recentExpenseNames',
  
  // Expenses
  expenses = 'expenses',
  expense = 'expense',
  currentWeekExpenses = 'currentWeekExpenses',
  weeklyExpenses = 'weeklyExpenses',
  monthlyExpenses = 'monthlyExpenses',
  dashboardSummary = 'dashboardSummary',
  expenseStatistics = 'expenseStatistics',
  
  // Health
  healthCheck = 'healthCheck'
}

/**
 * Helper type to extract parameters from an operation
 */
export type ExtractParameters<T extends keyof ApiOperations> = 
  ApiOperations[T] extends { parameters: infer P } ? P : {};

/**
 * Helper type to extract request body from an operation
 */
export type ExtractRequestBody<T extends keyof ApiOperations> = 
  ApiOperations[T] extends { requestBody: { content: { 'application/json': infer B } } } 
    ? B 
    : never;

/**
 * Helper type to extract response data from an operation
 */
export type ExtractResponseData<T extends keyof ApiOperations> = 
  ApiOperations[T] extends { responses: { 200: { content: { '*/*': { data: infer D } } } } }
    ? D
    : ApiOperations[T] extends { responses: { 201: { content: { '*/*': { data: infer D } } } } }
    ? D
    : never;

/**
 * Type for mutation variables that combine path params and request body
 */
export type MutationVariables<
  TOperation extends keyof ApiOperations,
  TParams = ExtractParameters<TOperation>,
  TBody = ExtractRequestBody<TOperation>
> = (TParams extends { path: any } ? { params: TParams['path'] } : {}) &
    (TBody extends never ? {} : { body: TBody });

/**
 * Type for query parameters that combines path and query params
 */
export type QueryVariables<
  TOperation extends keyof ApiOperations,
  TParams = ExtractParameters<TOperation>
> = TParams extends { path: any; query: any }
  ? TParams['path'] & TParams['query']
  : TParams extends { path: any }
  ? TParams['path']
  : TParams extends { query: any }
  ? TParams['query']
  : {};