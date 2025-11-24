/**
 * Shared Test Utilities
 * 
 * Provides consistent mocking patterns and test helpers across all test files.
 * This eliminates duplicate mock setups and ensures consistency.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a fresh QueryClient for each test with retry disabled
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

/**
 * Wrapper component that provides QueryClient context
 */
interface WrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function TestWrapper({ children, queryClient }: WrapperProps) {
  const client = queryClient || createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with QueryClientProvider
 */
export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper queryClient={queryClient}>{children}</TestWrapper>
    ),
    ...renderOptions,
  });
}

/**
 * Default mock return value for mutation hooks (useCreateItem, useUpdateItem, useDeleteItem)
 */
export function createMockMutation(overrides = {}) {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
    ...overrides,
  };
}

/**
 * Default mock return value for query hooks (useShoppingLists, useShoppingListDetail)
 */
export function createMockQuery(overrides = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

/**
 * Mock expo-router's useLocalSearchParams
 */
export function mockUseLocalSearchParams(params: Record<string, string>) {
  const { useLocalSearchParams } = require('expo-router');
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);
}

/**
 * Common expo-router mock configuration
 */
export const expoRouterMock = {
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
};

/**
 * Common safe area context mock configuration
 */
export const safeAreaContextMock = {
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};

/**
 * Setup standard mocks for list detail screen tests
 */
export function setupListDetailMocks(hooks: {
  useShoppingListDetail?: any;
  useCreateItem?: any;
  useDeleteItem?: any;
  useUpdateItem?: any;
}) {
  const useShoppingListsModule = require('@/hooks/use-shopping-lists');
  
  if (hooks.useShoppingListDetail !== undefined) {
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail')
      .mockReturnValue(hooks.useShoppingListDetail);
  }
  
  if (hooks.useCreateItem !== undefined) {
    jest.spyOn(useShoppingListsModule, 'useCreateItem')
      .mockReturnValue(hooks.useCreateItem);
  }
  
  if (hooks.useDeleteItem !== undefined) {
    jest.spyOn(useShoppingListsModule, 'useDeleteItem')
      .mockReturnValue(hooks.useDeleteItem);
  }
  
  if (hooks.useUpdateItem !== undefined) {
    jest.spyOn(useShoppingListsModule, 'useUpdateItem')
      .mockReturnValue(hooks.useUpdateItem);
  }
}

/**
 * Mock factory for shopping lists API hooks
 */
export const mockShoppingListsHooks = {
  useShoppingLists: () => createMockQuery(),
  useShoppingListDetail: () => createMockQuery(),
  useCreateList: () => createMockMutation(),
  useUpdateList: () => createMockMutation(),
  useDeleteList: () => createMockMutation(),
  useCreateItem: () => createMockMutation(),
  useUpdateItem: () => createMockMutation(),
  useDeleteItem: () => createMockMutation(),
};

/**
 * Jest mock configuration for @/hooks/use-shopping-lists
 * Use this in jest.mock() calls
 */
export function createShoppingListsHooksMock() {
  return {
    useShoppingLists: jest.fn(mockShoppingListsHooks.useShoppingLists),
    useShoppingListDetail: jest.fn(mockShoppingListsHooks.useShoppingListDetail),
    useCreateList: jest.fn(mockShoppingListsHooks.useCreateList),
    useUpdateList: jest.fn(mockShoppingListsHooks.useUpdateList),
    useDeleteList: jest.fn(mockShoppingListsHooks.useDeleteList),
    useCreateItem: jest.fn(mockShoppingListsHooks.useCreateItem),
    useUpdateItem: jest.fn(mockShoppingListsHooks.useUpdateItem),
    useDeleteItem: jest.fn(mockShoppingListsHooks.useDeleteItem),
  };
}
