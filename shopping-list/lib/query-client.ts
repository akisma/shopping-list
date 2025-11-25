/**
 * React Query Configuration
 * QueryClient setup with default options
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data considered fresh for 30 seconds
      staleTime: 30 * 1000,
      
      // Cache time: Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (good for kitchen environment)
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Refetch on reconnect (important for spotty network)
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});
