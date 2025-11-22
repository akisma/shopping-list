import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useShoppingLists, useCreateShoppingList } from './use-shopping-lists';
import { shoppingListsApi } from '../api/client';
import type { ReactNode } from 'react';

// Mock the API client
jest.mock('../api/client', () => ({
  shoppingListsApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    send: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useShoppingLists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch shopping lists successfully', async () => {
    const mockLists = {
      lists: [
        { id: '1', name: 'Groceries', status: 'draft' as const, itemCount: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ],
    };
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLists.lists);
  });

  it('should handle fetch error', async () => {
    (shoppingListsApi.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});

describe('useCreateShoppingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a shopping list successfully', async () => {
    const mockCreatedList = {
      id: '1',
      name: 'New List',
      status: 'draft' as const,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    (shoppingListsApi.create as jest.Mock).mockResolvedValue(mockCreatedList);

    const { result } = renderHook(() => useCreateShoppingList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      result.current.mutate({ name: 'New List' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCreatedList);
    expect(shoppingListsApi.create).toHaveBeenCalledWith({ name: 'New List' });
  });

  it('should handle create error', async () => {
    (shoppingListsApi.create as jest.Mock).mockRejectedValue(new Error('Failed to create'));

    const { result } = renderHook(() => useCreateShoppingList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      result.current.mutate({ name: 'New List' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('should invalidate shopping lists query after successful creation', async () => {
    const mockCreatedList = {
      id: '1',
      name: 'New List',
      status: 'draft' as const,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    const mockLists = { lists: [mockCreatedList] };
    (shoppingListsApi.create as jest.Mock).mockResolvedValue(mockCreatedList);
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);

    const wrapper = createWrapper();
    
    // First render the lists query
    const { result: listsResult } = renderHook(() => useShoppingLists(), { wrapper });
    await waitFor(() => expect(listsResult.current.isSuccess).toBe(true));

    // Then render the create mutation
    const { result: createResult } = renderHook(() => useCreateShoppingList(), { wrapper });

    // Create a new list
    await waitFor(() => {
      createResult.current.mutate({ name: 'New List' });
    });

    await waitFor(() => expect(createResult.current.isSuccess).toBe(true));

    // The lists query should be called again after creation
    await waitFor(() => {
      expect(shoppingListsApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
