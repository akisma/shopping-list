/**
 * Mock database implementation for testing
 * Implements IDatabase interface with in-memory storage
 */

import { IDatabase } from '../../src/types';
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
  ShoppingListWithCount,
  Reminder
} from '../../src/types';

export class MockDatabase implements IDatabase {
  private lists: Map<string, ShoppingList> = new Map();
  private items: Map<string, ShoppingListItem> = new Map();
  private reminders: Map<string, Reminder> = new Map();

  // Helper to reset state between tests
  reset() {
    this.lists.clear();
    this.items.clear();
    this.reminders.clear();
  }

  // Shopping Lists
  insertList(data: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): ShoppingList {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.lists.set(id, list);
    return list;
  }

  getListById(id: string): ShoppingListWithItems | null {
    const list = this.lists.get(id);
    if (!list) return null;

    const items = Array.from(this.items.values())
      .filter(item => item.shoppingListId === id);

    return { ...list, items };
  }

  getLists(filter?: { status?: string }): ShoppingList[] {
    let lists = Array.from(this.lists.values());
    
    if (filter?.status) {
      lists = lists.filter(list => list.status === filter.status);
    }
    
    return lists;
  }

  getListWithItemCount(id: string): ShoppingListWithCount | null {
    const list = this.lists.get(id);
    if (!list) return null;

    const itemCount = Array.from(this.items.values())
      .filter(item => item.shoppingListId === id).length;

    return { ...list, itemCount };
  }

  updateList(id: string, data: Partial<Omit<ShoppingList, 'id' | 'createdAt'>>): boolean {
    const list = this.lists.get(id);
    if (!list) return false;

    const updated: ShoppingList = {
      ...list,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.lists.set(id, updated);
    return true;
  }

  deleteList(id: string): boolean {
    const exists = this.lists.has(id);
    if (!exists) return false;

    // Cascade delete items and reminders
    Array.from(this.items.keys()).forEach(itemId => {
      const item = this.items.get(itemId);
      if (item?.shoppingListId === id) {
        this.items.delete(itemId);
      }
    });

    Array.from(this.reminders.keys()).forEach(reminderId => {
      const reminder = this.reminders.get(reminderId);
      if (reminder?.shoppingListId === id) {
        this.reminders.delete(reminderId);
      }
    });

    this.lists.delete(id);
    return true;
  }

  // Items
  insertItem(data: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): ShoppingListItem {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: ShoppingListItem = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(id, item);
    return item;
  }

  getItemById(listId: string, itemId: string): ShoppingListItem | null {
    const item = this.items.get(itemId);
    if (!item || item.shoppingListId !== listId) return null;
    return item;
  }

  getItemsByListId(listId: string): ShoppingListItem[] {
    return Array.from(this.items.values())
      .filter(item => item.shoppingListId === listId);
  }

  updateItem(
    listId: string,
    itemId: string,
    data: Partial<Omit<ShoppingListItem, 'id' | 'shoppingListId' | 'createdAt'>>
  ): boolean {
    const item = this.items.get(itemId);
    if (!item || item.shoppingListId !== listId) return false;

    const updated: ShoppingListItem = {
      ...item,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.items.set(itemId, updated);
    return true;
  }

  deleteItem(listId: string, itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item || item.shoppingListId !== listId) return false;
    
    this.items.delete(itemId);
    return true;
  }

  // Reminders
  insertReminder(data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const reminder: Reminder = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  getReminderById(id: string): Reminder | null {
    return this.reminders.get(id) || null;
  }

  updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>): boolean {
    const reminder = this.reminders.get(id);
    if (!reminder) return false;

    const updated: Reminder = {
      ...reminder,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.reminders.set(id, updated);
    return true;
  }

  deleteReminder(id: string): boolean {
    return this.reminders.delete(id);
  }
}
