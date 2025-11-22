/**
 * API Client Tests (TDD - RED Phase)
 * Testing axios wrapper for backend API calls
 */

import axios from 'axios';
import { apiClient, shoppingListsApi } from './client';
import { API_BASE_PATH } from '@/constants/api';
import type { 
  ShoppingListWithCount, 
  ShoppingListWithItems,
  CreateShoppingListRequest,
  UpdateShoppingListRequest 
} from '@/types/api';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {
        baseURL: 'http://localhost:3001/api/v1',
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      },
    })),
  };
});

describe('apiClient', () => {
  it('should have correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(API_BASE_PATH);
  });

  it('should have correct timeout', () => {
    expect(apiClient.defaults.timeout).toBe(30000);
  });

  it('should have correct headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('shoppingListsApi', () => {
  const mockLists: ShoppingListWithCount[] = [
    {
      id: '123',
      name: 'Groceries',
      status: 'active',
      itemCount: 5,
      createdAt: '2025-11-02T00:00:00Z',
      updatedAt: '2025-11-02T00:00:00Z',
    },
  ];

  const mockListWithItems: ShoppingListWithItems = {
    id: '123',
    name: 'Groceries',
    status: 'active',
    createdAt: '2025-11-02T00:00:00Z',
    updatedAt: '2025-11-02T00:00:00Z',
    items: [
      {
        id: 'item1',
        shoppingListId: '123',
        name: 'Milk',
        quantity: '1 gallon',
        notes: null,
        createdAt: '2025-11-02T00:00:00Z',
        updatedAt: '2025-11-02T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all shopping lists', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { lists: mockLists, total: 1 },
      });

      const result = await shoppingListsApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/shopping-lists', {
        params: undefined,
      });
      expect(result.lists).toEqual(mockLists);
      expect(result.total).toBe(1);
    });

    it('should fetch shopping lists with status filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { lists: mockLists, total: 1 },
      });

      await shoppingListsApi.getAll('active');

      expect(apiClient.get).toHaveBeenCalledWith('/shopping-lists', {
        params: { status: 'active' },
      });
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(shoppingListsApi.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch a shopping list by id', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockListWithItems });

      const result = await shoppingListsApi.getById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/shopping-lists/123');
      expect(result).toEqual(mockListWithItems);
    });
  });

  describe('create', () => {
    it('should create a new shopping list', async () => {
      const request: CreateShoppingListRequest = {
        name: 'New List',
        items: [{ name: 'Item 1' }],
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockListWithItems });

      const result = await shoppingListsApi.create(request);

      expect(apiClient.post).toHaveBeenCalledWith('/shopping-lists', request);
      expect(result).toEqual(mockListWithItems);
    });
  });

  describe('update', () => {
    it('should update a shopping list', async () => {
      const request: UpdateShoppingListRequest = { name: 'Updated' };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: mockListWithItems });

      const result = await shoppingListsApi.update('123', request);

      expect(apiClient.put).toHaveBeenCalledWith('/shopping-lists/123', request);
      expect(result).toEqual(mockListWithItems);
    });
  });

  describe('delete', () => {
    it('should delete a shopping list', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      await shoppingListsApi.delete('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/shopping-lists/123');
    });
  });

  describe('send', () => {
    it('should send a shopping list', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockListWithItems });

      const result = await shoppingListsApi.send('123');

      expect(apiClient.post).toHaveBeenCalledWith('/shopping-lists/123/send', {
        status: 'sent',
      });
      expect(result).toEqual(mockListWithItems);
    });

    it('should mark shopping list as completed', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockListWithItems });

      await shoppingListsApi.send('123', 'completed');

      expect(apiClient.post).toHaveBeenCalledWith('/shopping-lists/123/send', {
        status: 'completed',
      });
    });
  });
});
