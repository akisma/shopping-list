/**
 * Shared TypeScript types for Shopping List API
 * Matches backend/src/types/index.ts
 */

export interface ShoppingList {
  id: string;
  name: string;
  status: 'active' | 'sent' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

export interface ShoppingListWithCount extends ShoppingList {
  itemCount: number;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  shoppingListId: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateShoppingListRequest {
  name: string;
  items?: CreateItemRequest[];
}

export interface UpdateShoppingListRequest {
  name?: string;
  status?: 'active' | 'sent' | 'completed';
}

export interface SendShoppingListRequest {
  status?: 'sent' | 'completed';
}

export interface CreateItemRequest {
  name: string;
  quantity?: string;
  notes?: string;
}

export interface UpdateItemRequest {
  name?: string;
  quantity?: string;
  notes?: string;
}

export interface CreateReminderRequest {
  shoppingListId: string;
  scheduledAt: string;
}

export interface UpdateReminderRequest {
  scheduledAt?: string;
  status?: 'pending' | 'sent' | 'cancelled';
}

export interface GetAllListsResponse {
  lists: ShoppingListWithCount[];
  total: number;
}

// API Error Response
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    path: string;
  };
}
