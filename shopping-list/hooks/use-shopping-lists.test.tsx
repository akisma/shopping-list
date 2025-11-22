/**
 * Shopping Lists React Query Hooks Tests (TDD - RED Phase)
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useShoppingLists, useCreateShoppingList, useDeleteShoppingList } from './use-shopping-lists';
import { shoppingListsApi } from '@/api/client';
import type { ShoppingListWithCount, ShoppingListWithItems } from '@/types/api';

// Mock the API client
jest.mock('@/api/client');

const mockedApi = shoppingListsApi as jest.Mocked<typeof shoppingListsApi>;

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useShoppingLists', () => {
  const mockLists: ShoppingListWithCount[] = [
    {
      id: '1',
      name: 'Groceries',
      status: 'active',
      itemCount: 5,
      createdAt: '2025-11-02T00:00:00Z',
      updatedAt: '2025-11-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch shopping lists', async () => {
    mockedApi.getAll.mockResolvedValue({ lists: mockLists, total: 1 });

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLists);
    expect(mockedApi.getAll).toHaveBeenCalledWith(undefined);
  });

  it('should fetch shopping lists with status filter', async () => {
    mockedApi.getAll.mockResolvedValue({ lists: mockLists, total: 1 });

    const { result } = renderHook(() => useShoppingLists('active'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.getAll).toHaveBeenCalledWith('active');
  });

  it('should handle loading state', () => {
    mockedApi.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    const error = new Error('Network error');
    mockedApi.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useCreateShoppingList', () => {
  const mockCreatedList: ShoppingListWithItems = {
    id: '123',
    name: 'New List',
    status: 'active',
    createdAt: '2025-11-02T00:00:00Z',
    updatedAt: '2025-11-02T00:00:00Z',
    items: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a shopping list', async () => {
    mockedApi.create.mockResolvedValue(mockCreatedList);

    const { result } = renderHook(() => useCreateShoppingList(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'New List' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCreatedList);
    expect(mockedApi.create).toHaveBeenCalledWith({ name: 'New List' });
  });

  it('should handle creation error', async () => {
    const error = new Error('Creation failed');
    mockedApi.create.mockRejectedValue(error);

    const { result } = renderHook(() => useCreateShoppingList(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: 'New List' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useDeleteShoppingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a shopping list', async () => {
    mockedApi.delete.mockResolvedValue();

    const { result } = renderHook(() => useDeleteShoppingList(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.delete).toHaveBeenCalledWith('123');
  });

  it('should handle deletion error', async () => {
    const error = new Error('Deletion failed');
    mockedApi.delete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteShoppingList(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('123');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
