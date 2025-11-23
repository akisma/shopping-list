/**
 * Shopping Lists Screen - Delete List Tests
 * 
 * Testing delete functionality:
 * - Delete button visibility on list items
 * - Confirmation before deletion
 * - Successful deletion updates the list
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShoppingListsScreen from './index';
import { shoppingListsApi } from '@/api/client';

// Mock the API client
jest.mock('@/api/client', () => ({
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ShoppingListsScreen - Delete List', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show delete button for each list item', async () => {
    const mockLists = {
      lists: [
        {
          id: '1',
          name: 'Groceries',
          status: 'draft' as const,
          itemCount: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Hardware Store',
          status: 'draft' as const,
          itemCount: 3,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
    };
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeTruthy();
    });

    // Each list item should have a delete button
    const deleteButtons = screen.getAllByTestId(/delete-list-/);
    expect(deleteButtons).toHaveLength(2);
  });

  it('should show confirmation dialog when delete is pressed', async () => {
    const mockLists = {
      lists: [
        {
          id: '1',
          name: 'Groceries',
          status: 'draft' as const,
          itemCount: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
    };
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeTruthy();
    });

    // Press delete button
    const deleteButton = screen.getByTestId('delete-list-1');
    fireEvent.press(deleteButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeTruthy();
    });
    expect(screen.getByText(/delete.*groceries/i)).toBeTruthy();
  });

  it('should cancel deletion when cancel is pressed', async () => {
    const mockLists = {
      lists: [
        {
          id: '1',
          name: 'Groceries',
          status: 'draft' as const,
          itemCount: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
    };
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => screen.getByText('Groceries'));

    // Open confirmation
    fireEvent.press(screen.getByTestId('delete-list-1'));
    await waitFor(() => screen.getByText(/are you sure/i));

    // Press cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    // Dialog should close - list should still be visible
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).toBeNull();
    });
    expect(screen.getByText('Groceries')).toBeTruthy();

    // API should not be called
    expect(shoppingListsApi.delete).not.toHaveBeenCalled();
  });

  it('should delete list when confirmed', async () => {
    const mockLists = {
      lists: [
        {
          id: '1',
          name: 'Groceries',
          status: 'draft' as const,
          itemCount: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Hardware Store',
          status: 'draft' as const,
          itemCount: 3,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
    };
    
    (shoppingListsApi.getAll as jest.Mock)
      .mockResolvedValueOnce(mockLists)
      .mockResolvedValueOnce({
        lists: [mockLists.lists[1]], // Only Hardware Store remains
      });
    (shoppingListsApi.delete as jest.Mock).mockResolvedValue(undefined);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => screen.getByText('Groceries'));

    // Open confirmation and confirm
    fireEvent.press(screen.getByTestId('delete-list-1'));
    await waitFor(() => screen.getByText(/are you sure/i));
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.press(deleteButton);

    // API should be called
    await waitFor(() => {
      expect(shoppingListsApi.delete).toHaveBeenCalledWith('1');
    });

    // List should be refetched
    await waitFor(() => {
      expect(shoppingListsApi.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('should show error message if deletion fails', async () => {
    const mockLists = {
      lists: [
        {
          id: '1',
          name: 'Groceries',
          status: 'draft' as const,
          itemCount: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
    };
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue(mockLists);
    (shoppingListsApi.delete as jest.Mock).mockRejectedValue(new Error('Server error'));

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => screen.getByText('Groceries'));

    // Try to delete
    fireEvent.press(screen.getByTestId('delete-list-1'));
    await waitFor(() => screen.getByText(/are you sure/i));
    fireEvent.press(screen.getByText('Delete'));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to delete/i)).toBeTruthy();
    });
  });
});
