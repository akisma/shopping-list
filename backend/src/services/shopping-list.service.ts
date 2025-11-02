/**
 * Shopping List Service - contains all business logic
 * No business logic in DB layer - services coordinate DB calls
 */

import type { IDatabase } from '../types';
import type {
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  SendShoppingListRequest,
  GetAllListsResponse,
  ShoppingListWithItems,
  ShoppingListWithCount
} from '../types';
import { validateUUID } from '../middleware/validation';

export class ShoppingListService {
  constructor(private db: IDatabase) {}

  create(data: CreateShoppingListRequest): ShoppingListWithItems {
    // Create the list
    const list = this.db.insertList({
      name: data.name,
      status: 'active'
    });

    // Create items if provided
    const items = data.items?.map(itemData =>
      this.db.insertItem({
        shoppingListId: list.id,
        name: itemData.name,
        quantity: itemData.quantity || null,
        notes: itemData.notes || null
      })
    ) || [];

    return {
      ...list,
      items
    };
  }

  getAll(filter?: { status?: string }): GetAllListsResponse {
    const lists = this.db.getLists(filter);
    
    // Add item count to each list
    const listsWithCount: ShoppingListWithCount[] = lists.map(list => {
      const listWithCount = this.db.getListWithItemCount(list.id);
      return listWithCount!; // We know it exists since we just fetched it
    });

    return {
      lists: listsWithCount,
      total: listsWithCount.length
    };
  }

  getById(id: string): ShoppingListWithItems | null {
    validateUUID(id);
    return this.db.getListById(id);
  }

  update(id: string, data: UpdateShoppingListRequest): ShoppingListWithItems | null {
    validateUUID(id);
    
    const success = this.db.updateList(id, data);
    if (!success) return null;

    return this.db.getListById(id);
  }

  delete(id: string): boolean {
    validateUUID(id);
    return this.db.deleteList(id);
  }

  send(id: string, options?: SendShoppingListRequest): ShoppingListWithItems | null {
    validateUUID(id);
    
    const status = options?.status || 'sent';
    const success = this.db.updateList(id, { status });
    
    if (!success) return null;
    return this.db.getListById(id);
  }
}
