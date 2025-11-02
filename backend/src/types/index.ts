/**
 * Core domain types for shopping list application
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

// Database interface for dependency injection
export interface IDatabase {
  // Shopping Lists
  insertList(data: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): ShoppingList;
  getListById(id: string): ShoppingListWithItems | null;
  getLists(filter?: { status?: string }): ShoppingList[];
  getListWithItemCount(id: string): ShoppingListWithCount | null;
  updateList(id: string, data: Partial<Omit<ShoppingList, 'id' | 'createdAt'>>): boolean;
  deleteList(id: string): boolean;
  
  // Items
  insertItem(data: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): ShoppingListItem;
  getItemById(listId: string, itemId: string): ShoppingListItem | null;
  getItemsByListId(listId: string): ShoppingListItem[];
  updateItem(listId: string, itemId: string, data: Partial<Omit<ShoppingListItem, 'id' | 'shoppingListId' | 'createdAt'>>): boolean;
  deleteItem(listId: string, itemId: string): boolean;
  
  // Reminders
  insertReminder(data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder;
  getReminderById(id: string): Reminder | null;
  updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>): boolean;
  deleteReminder(id: string): boolean;
}
