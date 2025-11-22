/**
 * API Client (TDD - GREEN Phase)
 * Axios wrapper for backend API communication
 */

import axios, { AxiosInstance } from 'axios';
import { API_BASE_PATH, API_TIMEOUT, ENDPOINTS } from '@/constants/api';
import type {
  ShoppingListWithCount,
  ShoppingListWithItems,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  SendShoppingListRequest,
  GetAllListsResponse,
} from '@/types/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_PATH,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Shopping Lists API
 */
export const shoppingListsApi = {
  /**
   * Get all shopping lists
   */
  async getAll(status?: 'active' | 'sent' | 'completed'): Promise<GetAllListsResponse> {
    const params = status ? { status } : undefined;
    const response = await apiClient.get<GetAllListsResponse>(
      ENDPOINTS.SHOPPING_LISTS,
      { params }
    );
    return response.data;
  },

  /**
   * Get shopping list by ID
   */
  async getById(id: string): Promise<ShoppingListWithItems> {
    const response = await apiClient.get<ShoppingListWithItems>(
      ENDPOINTS.SHOPPING_LIST_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create new shopping list
   */
  async create(data: CreateShoppingListRequest): Promise<ShoppingListWithItems> {
    const response = await apiClient.post<ShoppingListWithItems>(
      ENDPOINTS.SHOPPING_LISTS,
      data
    );
    return response.data;
  },

  /**
   * Update shopping list
   */
  async update(
    id: string,
    data: UpdateShoppingListRequest
  ): Promise<ShoppingListWithItems> {
    const response = await apiClient.put<ShoppingListWithItems>(
      ENDPOINTS.SHOPPING_LIST_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete shopping list
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.SHOPPING_LIST_BY_ID(id));
  },

  /**
   * Send shopping list (mark as sent or completed)
   */
  async send(
    id: string,
    status: 'sent' | 'completed' = 'sent'
  ): Promise<ShoppingListWithItems> {
    const request: SendShoppingListRequest = { status };
    const response = await apiClient.post<ShoppingListWithItems>(
      ENDPOINTS.SEND_SHOPPING_LIST(id),
      request
    );
    return response.data;
  },
};
