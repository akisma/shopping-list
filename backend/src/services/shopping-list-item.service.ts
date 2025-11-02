/**
 * Shopping List Item Service - manages items within shopping lists
 */

import type { IDatabase } from '../types';
import type {
  CreateItemRequest,
  UpdateItemRequest,
  ShoppingListItem
} from '../types';
import { validateUUID } from '../middleware/validation';

export class ShoppingListItemService {
  constructor(private db: IDatabase) {}

  add(listId: string, data: CreateItemRequest): ShoppingListItem {
    validateUUID(listId);

    // Verify list exists
    const list = this.db.getListById(listId);
    if (!list) {
      throw new Error('Shopping list not found');
    }

    return this.db.insertItem({
      shoppingListId: listId,
      name: data.name,
      quantity: data.quantity || null,
      notes: data.notes || null
    });
  }

  update(listId: string, itemId: string, data: UpdateItemRequest): ShoppingListItem | null {
    validateUUID(listId);
    validateUUID(itemId);

    const success = this.db.updateItem(listId, itemId, data);
    if (!success) return null;

    return this.db.getItemById(listId, itemId);
  }

  delete(listId: string, itemId: string): boolean {
    validateUUID(listId);
    validateUUID(itemId);

    return this.db.deleteItem(listId, itemId);
  }
}
