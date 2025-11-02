/**
 * SQLite Database Implementation
 * Pure data access layer - NO business logic
 */

import Database from 'better-sqlite3';
import type { IDatabase } from '../types';
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
  ShoppingListWithCount,
  Reminder
} from '../types';
import { readFileSync } from 'fs';
import { join } from 'path';

export class SQLiteDatabase implements IDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    this.initializeSchema();
  }

  private initializeSchema() {
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    this.db.exec(schemaSQL);
  }

  // Shopping Lists
  insertList(data: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): ShoppingList {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO shopping_lists (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, data.name, data.status, now, now);
    
    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  getListById(id: string): ShoppingListWithItems | null {
    const listStmt = this.db.prepare(`
      SELECT id, name, status, created_at as createdAt, updated_at as updatedAt
      FROM shopping_lists
      WHERE id = ?
    `);
    
    const list = listStmt.get(id) as ShoppingList | undefined;
    if (!list) return null;

    const items = this.getItemsByListId(id);
    
    return { ...list, items };
  }

  getLists(filter?: { status?: string }): ShoppingList[] {
    let query = `
      SELECT id, name, status, created_at as createdAt, updated_at as updatedAt
      FROM shopping_lists
    `;
    
    const params: string[] = [];
    
    if (filter?.status) {
      query += ' WHERE status = ?';
      params.push(filter.status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as ShoppingList[];
  }

  getListWithItemCount(id: string): ShoppingListWithCount | null {
    const stmt = this.db.prepare(`
      SELECT 
        sl.id,
        sl.name,
        sl.status,
        sl.created_at as createdAt,
        sl.updated_at as updatedAt,
        COUNT(sli.id) as itemCount
      FROM shopping_lists sl
      LEFT JOIN shopping_list_items sli ON sl.id = sli.shopping_list_id
      WHERE sl.id = ?
      GROUP BY sl.id
    `);
    
    return stmt.get(id) as ShoppingListWithCount | null;
  }

  updateList(id: string, data: Partial<Omit<ShoppingList, 'id' | 'createdAt'>>): boolean {
    const updates: string[] = [];
    const params: (string | number)[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    params.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE shopping_lists
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteList(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM shopping_lists WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Items
  insertItem(data: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): ShoppingListItem {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO shopping_list_items (id, shopping_list_id, name, quantity, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.shoppingListId,
      data.name,
      data.quantity,
      data.notes,
      now,
      now
    );
    
    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  getItemById(listId: string, itemId: string): ShoppingListItem | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        shopping_list_id as shoppingListId,
        name,
        quantity,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_list_items
      WHERE id = ? AND shopping_list_id = ?
    `);
    
    return stmt.get(itemId, listId) as ShoppingListItem | null;
  }

  getItemsByListId(listId: string): ShoppingListItem[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        shopping_list_id as shoppingListId,
        name,
        quantity,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_list_items
      WHERE shopping_list_id = ?
      ORDER BY created_at ASC
    `);
    
    return stmt.all(listId) as ShoppingListItem[];
  }

  updateItem(
    listId: string,
    itemId: string,
    data: Partial<Omit<ShoppingListItem, 'id' | 'shoppingListId' | 'createdAt'>>
  ): boolean {
    const updates: string[] = [];
    const params: (string | null)[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    
    if (data.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(data.quantity);
    }
    
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    params.push(itemId);
    params.push(listId);
    
    const stmt = this.db.prepare(`
      UPDATE shopping_list_items
      SET ${updates.join(', ')}
      WHERE id = ? AND shopping_list_id = ?
    `);
    
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteItem(listId: string, itemId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM shopping_list_items
      WHERE id = ? AND shopping_list_id = ?
    `);
    
    const result = stmt.run(itemId, listId);
    return result.changes > 0;
  }

  // Reminders
  insertReminder(data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO reminders (id, shopping_list_id, scheduled_at, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.shoppingListId,
      data.scheduledAt,
      data.status,
      now,
      now
    );
    
    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  getReminderById(id: string): Reminder | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        shopping_list_id as shoppingListId,
        scheduled_at as scheduledAt,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM reminders
      WHERE id = ?
    `);
    
    return stmt.get(id) as Reminder | null;
  }

  updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>): boolean {
    const updates: string[] = [];
    const params: string[] = [];
    
    if (data.scheduledAt !== undefined) {
      updates.push('scheduled_at = ?');
      params.push(data.scheduledAt);
    }
    
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    params.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE reminders
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteReminder(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM reminders WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close() {
    this.db.close();
  }
}
