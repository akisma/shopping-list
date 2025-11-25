/**
 * List Detail Screen - Delete Item Tests (TDD - RED Phase)
 * Tests for deleting items from a shopping list
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListDetailScreen from './list-detail';
import * as useShoppingListsModule from '@/hooks/use-shopping-lists';
import type { ShoppingListWithItems } from '@/types/api';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => ({ id: 'list-1' }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ListDetailScreen - Delete Item', () => {
  let queryClient: QueryClient;
  const mockDeleteItem = jest.fn();

  const mockListWithItems: ShoppingListWithItems = {
    id: 'list-1',
    name: 'Grocery List',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    items: [
      { 
        id: 'item-1', 
        shoppingListId: 'list-1',
        name: 'Milk', 
        quantity: '1 gallon', 
        notes: 'Whole milk',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      { 
        id: 'item-2', 
        shoppingListId: 'list-1',
        name: 'Bread', 
        quantity: '2 loaves', 
        notes: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      { 
        id: 'item-3', 
        shoppingListId: 'list-1',
        name: 'Eggs', 
        quantity: '', 
        notes: 'Free range',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();

    // Mock useShoppingListDetail
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
      data: mockListWithItems,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    // Mock useCreateItem
    jest.spyOn(useShoppingListsModule, 'useCreateItem').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);

    // Mock useDeleteItem
    jest.spyOn(useShoppingListsModule, 'useDeleteItem').mockReturnValue({
      mutate: mockDeleteItem,
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);

    // Mock useUpdateItem
    jest.spyOn(useShoppingListsModule, 'useUpdateItem').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);
  });

  describe('Delete Button Visibility', () => {
    it('should show delete button on each item card', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Each item should have a delete button
      const deleteButtons = screen.getAllByTestId(/delete-item-button-/);
      expect(deleteButtons).toHaveLength(3);

      // Verify specific item delete buttons exist
      expect(screen.getByTestId('delete-item-button-item-1')).toBeTruthy();
      expect(screen.getByTestId('delete-item-button-item-2')).toBeTruthy();
      expect(screen.getByTestId('delete-item-button-item-3')).toBeTruthy();
    });
  });

  describe('Confirmation Modal', () => {
    it('should open confirmation modal when delete button is pressed', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Press delete button for first item
      const deleteButton = screen.getByTestId('delete-item-button-item-1');
      fireEvent.press(deleteButton);

      // Confirmation modal should appear
      expect(screen.getByText(/are you sure/i)).toBeTruthy();
      // Item name appears both in list and in confirmation message
      const milkTexts = screen.getAllByText(/milk/i);
      expect(milkTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('cancel-delete-button')).toBeTruthy();
      expect(screen.getByTestId('confirm-delete-button')).toBeTruthy();
    });
  });

  describe('Cancel Flow', () => {
    it('should close confirmation modal without deleting when cancel is pressed', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open confirmation modal
      const deleteButton = screen.getByTestId('delete-item-button-item-1');
      fireEvent.press(deleteButton);

      // Press cancel
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.press(cancelButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText(/are you sure/i)).toBeNull();
      });

      // Delete should not have been called
      expect(mockDeleteItem).not.toHaveBeenCalled();

      // Item should still be visible
      expect(screen.getByText('Milk')).toBeTruthy();
    });
  });

  describe('Successful Deletion', () => {
    it('should delete item and refresh list when confirmed', async () => {
      // Mock successful deletion
      mockDeleteItem.mockImplementation((itemId, { onSuccess }) => {
        onSuccess();
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open confirmation modal for first item
      const deleteButton = screen.getByTestId('delete-item-button-item-1');
      fireEvent.press(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      // Delete mutation should be called with correct itemId
      await waitFor(() => {
        expect(mockDeleteItem).toHaveBeenCalledWith(
          'item-1',
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when deletion fails', async () => {
      // Mock failed deletion
      mockDeleteItem.mockImplementation((itemId, { onError }) => {
        onError(new Error('Network error'));
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open confirmation modal
      const deleteButton = screen.getByTestId('delete-item-button-item-1');
      fireEvent.press(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText(/failed to delete item/i)).toBeTruthy();
      });

      // Item should still be visible (deletion failed)
      expect(screen.getByText('Milk')).toBeTruthy();
    });
  });

  describe('Empty State Transition', () => {
    it('should show empty state after deleting the last item', async () => {
      // Mock list with only one item
      const mockListWithOneItem: ShoppingListWithItems = {
        id: 'list-1',
        name: 'Grocery List',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        items: [{ 
          id: 'item-1', 
          shoppingListId: 'list-1',
          name: 'Milk', 
          quantity: '1 gallon', 
          notes: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }],
      };

      jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
        data: mockListWithOneItem,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      // Mock successful deletion that updates to empty list
      mockDeleteItem.mockImplementation((itemId, { onSuccess }) => {
        // After deletion, update mock to return empty list
        jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
          data: { ...mockListWithOneItem, items: [] },
          isLoading: false,
          isError: false,
          error: null,
          refetch: jest.fn(),
        } as any);
        onSuccess();
      });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Delete the only item
      const deleteButton = screen.getByTestId('delete-item-button-item-1');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByTestId('confirm-delete-button');
      fireEvent.press(confirmButton);

      // Wait for deletion
      await waitFor(() => {
        expect(mockDeleteItem).toHaveBeenCalled();
      });

      // Rerender to reflect empty state
      rerender(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Empty state should be shown
      expect(screen.getByText(/no items yet/i)).toBeTruthy();
      expect(screen.getByText(/add items to get started/i)).toBeTruthy();
    });
  });
});
