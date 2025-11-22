/**
 * Shopping Lists Screen Tests (TDD - RED Phase)
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShoppingListsScreen from './shopping-lists';
import { useShoppingLists } from '@/hooks/use-shopping-lists';

// Mock the hooks
jest.mock('@/hooks/use-shopping-lists');

const mockUseShoppingLists = useShoppingLists as jest.MockedFunction<typeof useShoppingLists>;

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

describe('ShoppingListsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading indicator when fetching lists', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should not display empty state while loading', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.queryByText(/no shopping lists/i)).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no lists exist', () => {
      mockUseShoppingLists.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/no shopping lists/i)).toBeTruthy();
    });

    it('should display create button in empty state', () => {
      mockUseShoppingLists.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      const createButtons = screen.getAllByText(/create your first list/i);
      expect(createButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display backend unavailable warning for connection errors', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('connect ECONNREFUSED 127.0.0.1:3001'),
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/backend unavailable/i)).toBeTruthy();
      expect(screen.getByText(/cannot communicate with backend/i)).toBeTruthy();
    });

    it('should display backend unavailable warning for network errors', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network Error'),
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/backend unavailable/i)).toBeTruthy();
    });

    it('should display backend unavailable warning for timeout errors', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('timeout of 10000ms exceeded'),
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/backend unavailable/i)).toBeTruthy();
    });

    it('should display generic error message for other errors', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Something else went wrong'),
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });

    it('should display retry button in error state', () => {
      mockUseShoppingLists.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network Error'),
        refetch: jest.fn(),
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/retry connection/i)).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    const mockLists = [
      {
        id: '1',
        name: 'Groceries',
        status: 'active' as const,
        itemCount: 5,
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      },
      {
        id: '2',
        name: 'Hardware Store',
        status: 'active' as const,
        itemCount: 3,
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      },
    ];

    it('should display list of shopping lists', () => {
      mockUseShoppingLists.mockReturnValue({
        data: mockLists,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText('Groceries')).toBeTruthy();
      expect(screen.getByText('Hardware Store')).toBeTruthy();
    });

    it('should display item count for each list', () => {
      mockUseShoppingLists.mockReturnValue({
        data: mockLists,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/5 items/i)).toBeTruthy();
      expect(screen.getByText(/3 items/i)).toBeTruthy();
    });

    it('should display create button when lists exist', () => {
      mockUseShoppingLists.mockReturnValue({
        data: mockLists,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ShoppingListsScreen />, { wrapper: createWrapper() });

      expect(screen.getByTestId('create-list-button')).toBeTruthy();
    });
  });
});
