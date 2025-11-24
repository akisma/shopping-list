/**
 * List Detail Screen - Send to Manager Tests (TDD - RED Phase)
 * Tests for sending shopping list to manager
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListDetailScreen from './list-detail';
import * as useShoppingListsModule from '@/hooks/use-shopping-lists';
import type { ShoppingListWithItems } from '@/types/api';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'list-123' }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('ListDetailScreen - Send to Manager', () => {
  let queryClient: QueryClient;
  const mockSendShoppingList = jest.fn();

  const mockListWithItems: ShoppingListWithItems = {
    id: 'list-123',
    name: 'Weekly Ingredients',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    items: [
      {
        id: 'item-1',
        shoppingListId: 'list-123',
        name: 'Tomatoes',
        quantity: '5 lbs',
        notes: 'Roma preferred',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        shoppingListId: 'list-123',
        name: 'Olive Oil',
        quantity: '2 bottles',
        notes: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
  };

  const mockEmptyList: ShoppingListWithItems = {
    ...mockListWithItems,
    items: [],
  };

  const mockSentList: ShoppingListWithItems = {
    ...mockListWithItems,
    status: 'sent',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();

    // Default mocks
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
      data: mockListWithItems,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(useShoppingListsModule, 'useCreateItem').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);

    jest.spyOn(useShoppingListsModule, 'useUpdateItem').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);

    jest.spyOn(useShoppingListsModule, 'useDeleteItem').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);

    jest.spyOn(useShoppingListsModule, 'useSendShoppingList').mockReturnValue({
      mutate: mockSendShoppingList,
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);
  });

  it('displays "Send to Manager" button when list has items and is active', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = getByTestId('send-to-manager-button');
    expect(sendButton).toBeTruthy();
  });

  it('shows confirmation dialog when "Send to Manager" is pressed', () => {
    const { getByTestId, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = getByTestId('send-to-manager-button');
    fireEvent.press(sendButton);

    expect(getByText('Send to Manager?')).toBeTruthy();
    expect(getByText(/Send "Weekly Ingredients" to the manager/)).toBeTruthy();
  });

  it('calls useSendShoppingList.mutate when send is confirmed', async () => {
    const { getByTestId, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = getByTestId('send-to-manager-button');
    fireEvent.press(sendButton);

    const confirmButton = getByText('Send');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockSendShoppingList).toHaveBeenCalledWith(
        { id: 'list-123', status: 'sent' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  it('displays success message when list is sent successfully', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    jest.spyOn(useShoppingListsModule, 'useSendShoppingList').mockReturnValue({
      mutate: jest.fn((_, { onSuccess }) => {
        onSuccess();
      }),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    } as any);

    const { getByTestId, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = getByTestId('send-to-manager-button');
    fireEvent.press(sendButton);

    const confirmButton = getByText('Send');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'List Sent!',
        'Your shopping list has been sent to the manager.'
      );
    });
  });

  it('displays error message when send fails', () => {
    jest.spyOn(useShoppingListsModule, 'useSendShoppingList').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: true,
      error: new Error('Network error'),
      reset: jest.fn(),
    } as any);

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    expect(getByText('Failed to send list. Please try again.')).toBeTruthy();
  });

  it('displays status badge showing list status', () => {
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
      data: mockSentList,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const statusBadge = getByTestId('status-badge');
    expect(statusBadge).toBeTruthy();
  });

  it('hides send button when list is empty', () => {
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
      data: mockEmptyList,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { queryByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = queryByTestId('send-to-manager-button');
    expect(sendButton).toBeNull();
  });

  it('hides send button when list is already sent', () => {
    jest.spyOn(useShoppingListsModule, 'useShoppingListDetail').mockReturnValue({
      data: mockSentList,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { queryByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <ListDetailScreen />
      </QueryClientProvider>
    );

    const sendButton = queryByTestId('send-to-manager-button');
    expect(sendButton).toBeNull();
  });
});
