/**
 * List Detail Screen - Create Item Tests (TDD - RED Phase)
 * 
 * Testing item creation functionality:
 * - Add button opens modal
 * - Form validation
 * - Successful creation
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListDetailScreen from './list-detail';
import { shoppingListsApi } from '@/api/client';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'list-123' })),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock the API client
jest.mock('@/api/client', () => ({
  shoppingListsApi: {
    getById: jest.fn(),
    createItem: jest.fn(),
  },
}));

const mockGetById = shoppingListsApi.getById as jest.MockedFunction<typeof shoppingListsApi.getById>;
const mockCreateItem = shoppingListsApi.createItem as jest.MockedFunction<typeof shoppingListsApi.createItem>;

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

const mockListWithItems = {
  id: 'list-123',
  name: 'Groceries',
  status: 'active' as const,
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
};

describe('ListDetailScreen - Create Item', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetById.mockResolvedValue(mockListWithItems);
  });

  describe('Add Item Button', () => {
    it('should show add item button', async () => {
      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });
    });

    it('should open create item modal when add button is pressed', async () => {
      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty item name', async () => {
      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Try to submit without entering name
      const saveButton = screen.getByTestId('save-item-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeTruthy();
      });

      // Should not call API
      expect(mockCreateItem).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Flow', () => {
    it('should close modal without creating item when cancel is pressed', async () => {
      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Enter some data
      fireEvent.changeText(screen.getByTestId('item-name-input'), 'Bread');

      // Press cancel
      const cancelButton = screen.getByTestId('cancel-item-button');
      fireEvent.press(cancelButton);

      // Modal should close (input disappears)
      await waitFor(() => {
        expect(screen.queryByTestId('item-name-input')).toBeNull();
      });

      // Should not call API
      expect(mockCreateItem).not.toHaveBeenCalled();
    });
  });

  describe('Successful Creation', () => {
    it('should create item with name only', async () => {
      // Use real timers for this test to allow React Query refetch to work
      jest.useRealTimers();
      
      const newItem = {
        id: 'item-2',
        shoppingListId: 'list-123',
        name: 'Bread',
        quantity: null,
        notes: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockCreateItem.mockResolvedValue(newItem);
      mockGetById.mockResolvedValueOnce(mockListWithItems)
        .mockResolvedValueOnce({
          ...mockListWithItems,
          items: [...mockListWithItems.items, newItem],
        });

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Enter item name
      fireEvent.changeText(screen.getByTestId('item-name-input'), 'Bread');

      // Submit
      fireEvent.press(screen.getByTestId('save-item-button'));

      await waitFor(() => {
        expect(mockCreateItem).toHaveBeenCalledWith('list-123', {
          name: 'Bread',
        });
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByTestId('item-name-input')).toBeNull();
      });

      // Verify getById was called at least twice (initial + after invalidation)
      await waitFor(() => {
        expect(mockGetById).toHaveBeenCalledWith('list-123');
        expect(mockGetById.mock.calls.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should create item with quantity', async () => {
      const newItem = {
        id: 'item-2',
        shoppingListId: 'list-123',
        name: 'Eggs',
        quantity: '1 dozen',
        notes: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockCreateItem.mockResolvedValue(newItem);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Enter item name and quantity
      fireEvent.changeText(screen.getByTestId('item-name-input'), 'Eggs');
      fireEvent.changeText(screen.getByTestId('item-quantity-input'), '1 dozen');

      // Submit
      fireEvent.press(screen.getByTestId('save-item-button'));

      await waitFor(() => {
        expect(mockCreateItem).toHaveBeenCalledWith('list-123', {
          name: 'Eggs',
          quantity: '1 dozen',
        });
      });
    });

    it('should create item with notes', async () => {
      const newItem = {
        id: 'item-2',
        shoppingListId: 'list-123',
        name: 'Bread',
        quantity: null,
        notes: 'Whole wheat',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockCreateItem.mockResolvedValue(newItem);

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Enter item name and notes
      fireEvent.changeText(screen.getByTestId('item-name-input'), 'Bread');
      fireEvent.changeText(screen.getByTestId('item-notes-input'), 'Whole wheat');

      // Submit
      fireEvent.press(screen.getByTestId('save-item-button'));

      await waitFor(() => {
        expect(mockCreateItem).toHaveBeenCalledWith('list-123', {
          name: 'Bread',
          notes: 'Whole wheat',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when creation fails', async () => {
      mockCreateItem.mockRejectedValue(new Error('Network error'));

      render(<ListDetailScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('add-item-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('add-item-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-name-input')).toBeTruthy();
      });

      // Enter item name
      fireEvent.changeText(screen.getByTestId('item-name-input'), 'Bread');

      // Submit
      fireEvent.press(screen.getByTestId('save-item-button'));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/failed to add item/i)).toBeTruthy();
      });

      // Modal should stay open
      expect(screen.getByTestId('item-name-input')).toBeTruthy();
    });
  });
});
