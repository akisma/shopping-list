/**
 * ReminderService tests - TDD RED phase
 * Stub implementation for Task 6 (Push Notifications)
 */

import { ReminderService } from '../../../src/services/reminder.service';
import { ShoppingListService } from '../../../src/services/shopping-list.service';
import { MockDatabase } from '../../mocks/mock-db';

describe('ReminderService.create', () => {
  let db: MockDatabase;
  let reminderService: ReminderService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    reminderService = new ReminderService(db);
    listService = new ShoppingListService(db);
  });

  it('should create reminder', () => {
    const list = listService.create({ name: 'Test List' });
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

    const result = reminderService.create({
      shoppingListId: list.id,
      scheduledAt: futureDate
    });

    expect(result).toHaveProperty('id');
    expect(result.shoppingListId).toBe(list.id);
    expect(result.scheduledAt).toBe(futureDate);
    expect(result.status).toBe('pending');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });

  it('should reject past scheduledAt', () => {
    const list = listService.create({ name: 'Test List' });
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

    expect(() => reminderService.create({
      shoppingListId: list.id,
      scheduledAt: pastDate
    })).toThrow(/past/i);
  });

  it('should verify list exists', () => {
    const fakeListId = '550e8400-e29b-41d4-a716-446655440000';
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    expect(() => reminderService.create({
      shoppingListId: fakeListId,
      scheduledAt: futureDate
    })).toThrow(/not found/i);
  });
});

describe('ReminderService.update', () => {
  let db: MockDatabase;
  let reminderService: ReminderService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    reminderService = new ReminderService(db);
    listService = new ShoppingListService(db);
  });

  it('should update reminder time', () => {
    const list = listService.create({ name: 'Test List' });
    const futureDate1 = new Date(Date.now() + 86400000).toISOString();
    const futureDate2 = new Date(Date.now() + 172800000).toISOString();

    const reminder = reminderService.create({
      shoppingListId: list.id,
      scheduledAt: futureDate1
    });

    const result = reminderService.update(reminder.id, {
      scheduledAt: futureDate2
    });

    expect(result?.scheduledAt).toBe(futureDate2);
  });

  it('should return null for non-existent reminder', () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';

    const result = reminderService.update(fakeId, {
      status: 'sent'
    });

    expect(result).toBeNull();
  });
});

describe('ReminderService.delete', () => {
  let db: MockDatabase;
  let reminderService: ReminderService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    reminderService = new ReminderService(db);
    listService = new ShoppingListService(db);
  });

  it('should delete reminder', () => {
    const list = listService.create({ name: 'Test List' });
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const reminder = reminderService.create({
      shoppingListId: list.id,
      scheduledAt: futureDate
    });

    const result = reminderService.delete(reminder.id);
    expect(result).toBe(true);
  });

  it('should return false for non-existent reminder', () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';

    const result = reminderService.delete(fakeId);
    expect(result).toBe(false);
  });
});
