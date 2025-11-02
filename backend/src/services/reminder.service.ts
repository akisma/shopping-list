/**
 * Reminder Service - stub implementation for Task 6
 * Will be fully implemented when adding push notifications
 */

import type { IDatabase } from '../types';
import type {
  CreateReminderRequest,
  UpdateReminderRequest,
  Reminder
} from '../types';
import { validateUUID } from '../middleware/validation';

export class ReminderService {
  constructor(private db: IDatabase) {}

  create(data: CreateReminderRequest): Reminder {
    validateUUID(data.shoppingListId);

    // Verify list exists
    const list = this.db.getListById(data.shoppingListId);
    if (!list) {
      throw new Error('Shopping list not found');
    }

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(data.scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new Error('Cannot schedule reminder in the past');
    }

    return this.db.insertReminder({
      shoppingListId: data.shoppingListId,
      scheduledAt: data.scheduledAt,
      status: 'pending'
    });
  }

  update(id: string, data: UpdateReminderRequest): Reminder | null {
    validateUUID(id);

    const success = this.db.updateReminder(id, data);
    if (!success) return null;

    return this.db.getReminderById(id);
  }

  delete(id: string): boolean {
    validateUUID(id);
    return this.db.deleteReminder(id);
  }
}
