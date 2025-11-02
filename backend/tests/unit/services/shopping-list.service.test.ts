/**
 * ShoppingListService tests - TDD RED phase
 */

import { ShoppingListService } from '../../../src/services/shopping-list.service';
import { MockDatabase } from '../../mocks/mock-db';

describe('ShoppingListService.create', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should create a list with name only', () => {
    const result = service.create({ name: 'Weekly Order' });

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Weekly Order');
    expect(result.status).toBe('active');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
    
    // ID should be UUID
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should create list and items together', () => {
    const result = service.create({
      name: 'Weekly Order',
      items: [
        { name: 'tomatoes', quantity: '2 cases' },
        { name: 'onions' }
      ]
    });

    expect(result.name).toBe('Weekly Order');
    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('tomatoes');
    expect(result.items[0].quantity).toBe('2 cases');
    expect(result.items[1].name).toBe('onions');
  });

  it('should generate UUID for new list', () => {
    const result = service.create({ name: 'Test List' });
    
    // UUID v4 format check
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should set createdAt and updatedAt', () => {
    const result = service.create({ name: 'Test List' });
    
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    
    // Both should be valid ISO strings
    expect(() => new Date(result.createdAt)).not.toThrow();
    expect(() => new Date(result.updatedAt)).not.toThrow();
  });

  it('should default status to active', () => {
    const result = service.create({ name: 'Test List' });
    expect(result.status).toBe('active');
  });
});

describe('ShoppingListService.getAll', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should return empty array when no lists', () => {
    const result = service.getAll();
    
    expect(result.lists).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should return all lists', () => {
    service.create({ name: 'List 1' });
    service.create({ name: 'List 2' });
    service.create({ name: 'List 3' });

    const result = service.getAll();
    
    expect(result.lists).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('should filter by status', () => {
    service.create({ name: 'Active List 1' });
    service.create({ name: 'Active List 2' });
    const list3 = service.create({ name: 'Sent List' });
    
    // Update one list to sent status
    service.update(list3.id, { status: 'sent' });

    const activeResult = service.getAll({ status: 'active' });
    expect(activeResult.lists).toHaveLength(2);
    expect(activeResult.total).toBe(2);

    const sentResult = service.getAll({ status: 'sent' });
    expect(sentResult.lists).toHaveLength(1);
    expect(sentResult.total).toBe(1);
  });

  it('should include item count per list', () => {
    service.create({
      name: 'List with items',
      items: [
        { name: 'item1' },
        { name: 'item2' },
        { name: 'item3' }
      ]
    });

    const result = service.getAll();
    
    expect(result.lists[0]).toHaveProperty('itemCount');
    expect(result.lists[0].itemCount).toBe(3);
  });
});

describe('ShoppingListService.getById', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should return list with items', () => {
    const created = service.create({
      name: 'Test List',
      items: [
        { name: 'item1' },
        { name: 'item2' }
      ]
    });

    const result = service.getById(created.id);
    
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Test List');
    expect(result?.items).toHaveLength(2);
  });

  it('should return null for non-existent list', () => {
    const result = service.getById('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBeNull();
  });

  it('should validate UUID format', () => {
    expect(() => service.getById('invalid-id')).toThrow(/uuid/i);
  });
});

describe('ShoppingListService.update', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should update list name', () => {
    const list = service.create({ name: 'Old Name' });
    
    const result = service.update(list.id, { name: 'New Name' });
    
    expect(result).not.toBeNull();
    expect(result?.name).toBe('New Name');
    expect(new Date(result!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(result!.createdAt).getTime());
  });

  it('should update status', () => {
    const list = service.create({ name: 'Test List' });
    
    const result = service.update(list.id, { status: 'sent' });
    
    expect(result?.status).toBe('sent');
  });

  it('should preserve unchanged fields', () => {
    const list = service.create({ name: 'Original Name' });
    const originalCreatedAt = list.createdAt;
    
    const result = service.update(list.id, { status: 'completed' });
    
    expect(result?.name).toBe('Original Name');
    expect(result?.createdAt).toBe(originalCreatedAt);
  });

  it('should return null for non-existent list', () => {
    const result = service.update('550e8400-e29b-41d4-a716-446655440000', { name: 'New Name' });
    expect(result).toBeNull();
  });

  it('should update updatedAt timestamp', () => {
    const list = service.create({ name: 'Test List' });
    
    const result = service.update(list.id, { name: 'Updated Name' });
    
    // updatedAt should be >= createdAt (could be same if very fast)
    expect(new Date(result!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(result!.createdAt).getTime());
    expect(result?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('ShoppingListService.delete', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should delete existing list', () => {
    const list = service.create({ name: 'Test List' });
    
    const result = service.delete(list.id);
    expect(result).toBe(true);
    
    // Verify it's gone
    const retrieved = service.getById(list.id);
    expect(retrieved).toBeNull();
  });

  it('should return false for non-existent list', () => {
    const result = service.delete('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBe(false);
  });

  it('should validate UUID format', () => {
    expect(() => service.delete('invalid-id')).toThrow(/uuid/i);
  });
});

describe('ShoppingListService.send', () => {
  let db: MockDatabase;
  let service: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    service = new ShoppingListService(db);
  });

  it('should mark list as sent', () => {
    const list = service.create({ name: 'Test List' });
    
    const result = service.send(list.id);
    
    expect(result?.status).toBe('sent');
  });

  it('should allow custom status', () => {
    const list = service.create({ name: 'Test List' });
    
    const result = service.send(list.id, { status: 'completed' });
    
    expect(result?.status).toBe('completed');
  });

  it('should return null for non-existent list', () => {
    const result = service.send('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBeNull();
  });
});
