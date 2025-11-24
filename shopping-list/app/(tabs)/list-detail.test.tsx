/**
 * List Detail Screen Tests (TDD - RED Phase)
 * 
 * Testing philosophy:
 * - Focus on business logic and user interactions
 * - Test what users see and do, not framework internals
 * - Verify data display, navigation, loading/error states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import ListDetailScreen from './list-detail';
import { useShoppingListDetail } from '@/hooks/use-shopping-lists';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock the hooks
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useCreateItem: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    reset: jest.fn(),
  })),
  useDeleteItem: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
  })),
  useUpdateItem: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    reset: jest.fn(),
  })),
  useSendShoppingList: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    reset: jest.fn(),
  })),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseShoppingListDetail = useShoppingListDetail as jest.MockedFunction<typeof useShoppingListDetail>;

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  
  return Wrapper;
};

describe('ListDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: mock a valid list ID in params
    mockUseLocalSearchParams.mockReturnValue({ id: 'list-123' });
  });

  describe('Loading State', () => {
    it('should display loading indicator when fetching list details', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.getByText(/loading/i)).toBeTruthy();
    });

    it('should not display items while loading', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.queryByTestId(/^item-/)).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when list has no items', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/no items yet/i)).toBeTruthy();
      expect(screen.getByText(/add items to get started/i)).toBeTruthy();
    });

    it('should display add item button in empty state', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('add-item-button')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should display error message when list not found', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: {
          response: {
            status: 404,
            data: { message: 'Shopping list not found' },
          },
        },
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/not found/i)).toBeTruthy();
    });

    it('should display generic error for other errors', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });

    it('should display retry button in error state', () => {
      const mockRefetch = jest.fn();
      mockUseShoppingListDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('retry-button')).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should display all items in the list', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [
            {
              id: 'item-1',
              shoppingListId: 'list-123',
              name: 'Milk',
              quantity: '1 gallon',
              notes: null,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'item-2',
              shoppingListId: 'list-123',
              name: 'Bread',
              quantity: '2 loaves',
              notes: 'Whole wheat',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'item-3',
              shoppingListId: 'list-123',
              name: 'Eggs',
              quantity: '1 dozen',
              notes: null,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Milk')).toBeTruthy();
      expect(screen.getByText('Bread')).toBeTruthy();
      expect(screen.getByText('Eggs')).toBeTruthy();
    });

    it('should display item quantities when available', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [
            {
              id: 'item-1',
              shoppingListId: 'list-123',
              name: 'Milk',
              quantity: '1 gallon',
              notes: null,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('1 gallon')).toBeTruthy();
    });

    it('should display item notes when available', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [
            {
              id: 'item-2',
              shoppingListId: 'list-123',
              name: 'Bread',
              quantity: '2 loaves',
              notes: 'Whole wheat',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Whole wheat')).toBeTruthy();
    });

    it('should display add item button when items exist', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: 'list-123',
          name: 'Groceries',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          items: [
            {
              id: 'item-1',
              shoppingListId: 'list-123',
              name: 'Milk',
              quantity: '1 gallon',
              notes: null,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('add-item-button')).toBeTruthy();
    });
  });
});
