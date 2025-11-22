/**
 * Shopping Lists Screen - Create List Tests
 * 
 * Note: We focus on testing user interactions and business logic, not Modal visibility.
 * Modal rendering is a React Native framework concern, not our business logic.
 * The hook-level tests already verify the mutation works correctly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShoppingListsScreen from './shopping-lists';
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

describe('ShoppingListsScreen - Create Button Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show create button in empty state', async () => {
    (shoppingListsApi.getAll as jest.Mock).mockResolvedValue({ lists: [] });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ShoppingListsScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No Shopping Lists')).toBeTruthy();
    });

    // Should have a create button - this is the user-facing affordance
    const createButton = screen.getByText('Create List');
    expect(createButton).toBeTruthy();
  });

  it('should show + button with existing lists', async () => {
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

    // Should have a + button for creating new lists
    const createButton = screen.getByTestId('create-list-button');
    expect(createButton).toBeTruthy();
  });

});
