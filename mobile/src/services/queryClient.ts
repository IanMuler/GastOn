// TanStack Query client configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Mock hooks for development (will be replaced with real API calls later)
export const useMockExpenses = () => {
  // For now, we'll just import the mock data directly
  // Later this will be replaced with actual TanStack Query hooks
  return { data: [], isLoading: false, error: null };
};