/**
 * ShoppingListItemService tests - TDD RED phase
 */

import { ShoppingListItemService } from '../../../src/services/shopping-list-item.service';
import { ShoppingListService } from '../../../src/services/shopping-list.service';
import { MockDatabase } from '../../mocks/mock-db';

describe('ShoppingListItemService.add', () => {
  let db: MockDatabase;
  let itemService: ShoppingListItemService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    itemService = new ShoppingListItemService(db);
    listService = new ShoppingListService(db);
  });

  it('should add item with name only', () => {
    const list = listService.create({ name: 'Test List' });
    
    const result = itemService.add(list.id, { name: 'tomatoes' });

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('tomatoes');
    expect(result.shoppingListId).toBe(list.id);
    expect(result.quantity).toBeNull();
    expect(result.notes).toBeNull();
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });

  it('should add item with all fields', () => {
    const list = listService.create({ name: 'Test List' });
    
    const result = itemService.add(list.id, {
      name: 'tomatoes',
      quantity: '2 cases',
      notes: 'Roma variety'
    });

    expect(result.name).toBe('tomatoes');
    expect(result.quantity).toBe('2 cases');
    expect(result.notes).toBe('Roma variety');
  });

  it('should verify list exists', () => {
    const fakeListId = '550e8400-e29b-41d4-a716-446655440000';
    
    expect(() => itemService.add(fakeListId, { name: 'tomatoes' }))
      .toThrow(/not found/i);
  });

  it('should generate UUID for item', () => {
    const list = listService.create({ name: 'Test List' });
    
    const result = itemService.add(list.id, { name: 'tomatoes' });
    
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('ShoppingListItemService.update', () => {
  let db: MockDatabase;
  let itemService: ShoppingListItemService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    itemService = new ShoppingListItemService(db);
    listService = new ShoppingListService(db);
  });

  it('should update item name', () => {
    const list = listService.create({
      name: 'Test List',
      items: [{ name: 'Old Name' }]
    });
    const itemId = list.items[0].id;

    const result = itemService.update(list.id, itemId, { name: 'New Name' });

    expect(result?.name).toBe('New Name');
  });

  it('should update multiple fields', () => {
    const list = listService.create({
      name: 'Test List',
      items: [{ name: 'tomatoes' }]
    });
    const itemId = list.items[0].id;

    const result = itemService.update(list.id, itemId, {
      name: 'Updated Name',
      quantity: '5 lbs',
      notes: 'New notes'
    });

    expect(result?.name).toBe('Updated Name');
    expect(result?.quantity).toBe('5 lbs');
    expect(result?.notes).toBe('New notes');
  });

  it('should return null for non-existent item', () => {
    const list = listService.create({ name: 'Test List' });
    const fakeItemId = '550e8400-e29b-41d4-a716-446655440000';

    const result = itemService.update(list.id, fakeItemId, { name: 'New Name' });

    expect(result).toBeNull();
  });

  it('should update updatedAt timestamp', () => {
    const list = listService.create({
      name: 'Test List',
      items: [{ name: 'tomatoes' }]
    });
    const itemId = list.items[0].id;

    const result = itemService.update(list.id, itemId, { name: 'Updated' });

    expect(result?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(new Date(result!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(result!.createdAt).getTime());
  });
});

describe('ShoppingListItemService.delete', () => {
  let db: MockDatabase;
  let itemService: ShoppingListItemService;
  let listService: ShoppingListService;

  beforeEach(() => {
    db = new MockDatabase();
    itemService = new ShoppingListItemService(db);
    listService = new ShoppingListService(db);
  });

  it('should delete item', () => {
    const list = listService.create({
      name: 'Test List',
      items: [{ name: 'tomatoes' }]
    });
    const itemId = list.items[0].id;

    const result = itemService.delete(list.id, itemId);
    expect(result).toBe(true);

    // Verify it's gone
    const updatedList = listService.getById(list.id);
    expect(updatedList?.items).toHaveLength(0);
  });

  it('should return false for non-existent item', () => {
    const list = listService.create({ name: 'Test List' });
    const fakeItemId = '550e8400-e29b-41d4-a716-446655440000';

    const result = itemService.delete(list.id, fakeItemId);
    expect(result).toBe(false);
  });
});
