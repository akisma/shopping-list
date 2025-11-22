/**
 * Shopping Lists React Query Hooks (TDD - GREEN Phase)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingListsApi } from '@/api/client';
import type {
  ShoppingListWithCount,
  ShoppingListWithItems,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
} from '@/types/api';

// Query keys for cache management
export const shoppingListKeys = {
  all: ['shopping-lists'] as const,
  lists: (status?: string) => [...shoppingListKeys.all, { status }] as const,
  detail: (id: string) => [...shoppingListKeys.all, id] as const,
};

/**
 * Fetch all shopping lists
 */
export function useShoppingLists(status?: 'active' | 'sent' | 'completed') {
  return useQuery({
    queryKey: shoppingListKeys.lists(status),
    queryFn: async () => {
      const response = await shoppingListsApi.getAll(status);
      return response.lists;
    },
  });
}

/**
 * Fetch single shopping list with items
 */
export function useShoppingListDetail(id: string) {
  return useQuery({
    queryKey: shoppingListKeys.detail(id),
    queryFn: () => shoppingListsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new shopping list
 */
export function useCreateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShoppingListRequest) => shoppingListsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch all lists
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all });
    },
  });
}

/**
 * Update shopping list
 */
export function useUpdateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShoppingListRequest }) =>
      shoppingListsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific list and all lists
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all });
    },
  });
}

/**
 * Delete shopping list
 */
export function useDeleteShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shoppingListsApi.delete(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all });
    },
  });
}

/**
 * Send shopping list (mark as sent/completed)
 */
export function useSendShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: 'sent' | 'completed' }) =>
      shoppingListsApi.send(id, status),
    onSuccess: (_, variables) => {
      // Invalidate specific list and all lists
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all });
    },
  });
}
