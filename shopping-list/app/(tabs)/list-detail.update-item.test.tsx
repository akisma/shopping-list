import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import ListDetailScreen from './list-detail';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock the API hooks
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useCreateItem: jest.fn(),
  useDeleteItem: jest.fn(),
  useUpdateItem: jest.fn(),
}));

import { useShoppingListDetail, useCreateItem, useDeleteItem, useUpdateItem } from '@/hooks/use-shopping-lists';

const mockUseShoppingListDetail = useShoppingListDetail as jest.MockedFunction<typeof useShoppingListDetail>;
const mockUseCreateItem = useCreateItem as jest.MockedFunction<typeof useCreateItem>;
const mockUseDeleteItem = useDeleteItem as jest.MockedFunction<typeof useDeleteItem>;
const mockUseUpdateItem = useUpdateItem as jest.MockedFunction<typeof useUpdateItem>;

describe('ListDetailScreen - Update Item (Phase 4C)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '1',
      name: 'Weekly Groceries',
    });

    // Default mock implementations
    mockUseCreateItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);

    mockUseDeleteItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);

    mockUseUpdateItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Edit Button Visibility', () => {
    it('should display an edit button on each item card', () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
            { id: '2', name: 'Eggs', quantity: '12', notes: '', checked: false },
            { id: '3', name: 'Bread', quantity: '1 loaf', notes: 'Whole wheat', checked: true },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Each item should have an edit button
      const editButtons = screen.getAllByTestId(/^edit-item-button-/);
      expect(editButtons).toHaveLength(3);
      expect(screen.getByTestId('edit-item-button-1')).toBeTruthy();
      expect(screen.getByTestId('edit-item-button-2')).toBeTruthy();
      expect(screen.getByTestId('edit-item-button-3')).toBeTruthy();
    });
  });

  describe('Edit Modal Opens with Pre-filled Data', () => {
    it('should open edit modal with item data pre-filled when edit button is pressed', async () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Press edit button
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Form fields should be pre-filled with item data
      const nameInput = screen.getByTestId('item-name-input');
      const quantityInput = screen.getByTestId('item-quantity-input');
      const notesInput = screen.getByTestId('item-notes-input');

      expect(nameInput.props.value).toBe('Milk');
      expect(quantityInput.props.value).toBe('1 gallon');
      expect(notesInput.props.value).toBe('Whole milk');
    });

    it('should handle items with empty optional fields (quantity, notes)', async () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '2', name: 'Eggs', quantity: '', notes: '', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Press edit button
      const editButton = screen.getByTestId('edit-item-button-2');
      fireEvent.press(editButton);

      // Modal should open with name filled, but quantity and notes empty
      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      const nameInput = screen.getByTestId('item-name-input');
      const quantityInput = screen.getByTestId('item-quantity-input');
      const notesInput = screen.getByTestId('item-notes-input');

      expect(nameInput.props.value).toBe('Eggs');
      expect(quantityInput.props.value).toBe('');
      expect(notesInput.props.value).toBe('');
    });
  });

  describe('Validation', () => {
    it('should show validation error when name is cleared (empty)', async () => {
      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open edit modal
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Clear the name field
      const nameInput = screen.getByTestId('item-name-input');
      fireEvent.changeText(nameInput, '');

      // Press save button
      const saveButton = screen.getByTestId('save-item-button');
      fireEvent.press(saveButton);

      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeTruthy();
        expect(screen.getByText('Item name is required')).toBeTruthy();
      });

      // API should NOT be called
      const updateMock = mockUseUpdateItem.mock.results[0]?.value;
      expect(updateMock?.mutate).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Flow', () => {
    it('should close modal without updating when cancel is pressed', async () => {
      const mockMutate = jest.fn();
      mockUseUpdateItem.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open edit modal
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Make some changes
      const nameInput = screen.getByTestId('item-name-input');
      fireEvent.changeText(nameInput, 'Almond Milk');

      // Press cancel button
      const cancelButton = screen.getByTestId('cancel-item-button');
      fireEvent.press(cancelButton);

      // Modal should close and mutation should NOT be called
      await waitFor(() => {
        expect(screen.queryByText('Edit Item')).toBeNull();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Successful Update', () => {
    it('should update item and refresh list when save is pressed', async () => {
      const mockMutate = jest.fn((params, options) => {
        // Simulate successful mutation
        options?.onSuccess?.();
      });

      mockUseUpdateItem.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open edit modal
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Update the item
      const nameInput = screen.getByTestId('item-name-input');
      const quantityInput = screen.getByTestId('item-quantity-input');
      const notesInput = screen.getByTestId('item-notes-input');

      fireEvent.changeText(nameInput, 'Almond Milk');
      fireEvent.changeText(quantityInput, '2 cartons');
      fireEvent.changeText(notesInput, 'Unsweetened');

      // Press save button
      const saveButton = screen.getByTestId('save-item-button');
      fireEvent.press(saveButton);

      // Mutation should be called with correct data
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            itemId: '1',
            data: {
              name: 'Almond Milk',
              quantity: '2 cartons',
              notes: 'Unsweetened',
            },
          },
          expect.any(Object)
        );
      });

      // Modal should close after success
      await waitFor(() => {
        expect(screen.queryByText('Edit Item')).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when update fails', async () => {
      const mockMutate = jest.fn();
      mockUseUpdateItem.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: true,
        error: new Error('Network error'),
        reset: jest.fn(),
      } as any);

      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open edit modal
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Error should be displayed in modal
      await waitFor(() => {
        expect(screen.getByTestId('create-error')).toBeTruthy();
        expect(screen.getByText('Failed to update item. Please try again.')).toBeTruthy();
      });
    });
  });

  describe('Partial Updates', () => {
    it('should successfully update only quantity when only quantity is changed', async () => {
      const mockMutate = jest.fn((params, options) => {
        options?.onSuccess?.();
      });

      mockUseUpdateItem.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseShoppingListDetail.mockReturnValue({
        data: {
          id: '1',
          name: 'Weekly Groceries',
          items: [
            { id: '1', name: 'Milk', quantity: '1 gallon', notes: 'Whole milk', checked: false },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ListDetailScreen />
        </QueryClientProvider>
      );

      // Open edit modal
      const editButton = screen.getByTestId('edit-item-button-1');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Item')).toBeTruthy();
      });

      // Only change quantity
      const quantityInput = screen.getByTestId('item-quantity-input');
      fireEvent.changeText(quantityInput, '2 gallons');

      // Press save button
      const saveButton = screen.getByTestId('save-item-button');
      fireEvent.press(saveButton);

      // Mutation should be called with all fields (including unchanged ones)
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            itemId: '1',
            data: {
              name: 'Milk',
              quantity: '2 gallons',
              notes: 'Whole milk',
            },
          },
          expect.any(Object)
        );
      });
    });
  });
});
