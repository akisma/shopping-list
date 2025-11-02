/**
 * Validation middleware tests - TDD RED phase
 */

import {
  validateShoppingListCreate,
  validateShoppingListUpdate,
  validateItemCreate,
  validateItemUpdate,
  validateUUID
} from '../../../src/middleware/validation';

describe('validateShoppingListCreate', () => {
  it('should pass valid data', () => {
    const validData = { name: 'Weekly Order' };
    expect(() => validateShoppingListCreate(validData)).not.toThrow();
  });

  it('should reject empty name', () => {
    expect(() => validateShoppingListCreate({ name: '' }))
      .toThrow(/name/i);
  });

  it('should reject missing name', () => {
    expect(() => validateShoppingListCreate({}))
      .toThrow(/name/i);
  });

  it('should reject name too long (>200)', () => {
    const longName = 'a'.repeat(201);
    expect(() => validateShoppingListCreate({ name: longName }))
      .toThrow(/200/);
  });

  it('should accept optional items array', () => {
    const dataWithItems = {
      name: 'Weekly Order',
      items: [{ name: 'tomatoes' }]
    };
    expect(() => validateShoppingListCreate(dataWithItems)).not.toThrow();
  });
});

describe('validateShoppingListUpdate', () => {
  it('should accept partial updates', () => {
    expect(() => validateShoppingListUpdate({ name: 'New Name' })).not.toThrow();
  });

  it('should validate status enum', () => {
    expect(() => validateShoppingListUpdate({ status: 'invalid' as any }))
      .toThrow(/status/i);
  });

  it('should accept valid status', () => {
    expect(() => validateShoppingListUpdate({ status: 'sent' })).not.toThrow();
    expect(() => validateShoppingListUpdate({ status: 'active' })).not.toThrow();
    expect(() => validateShoppingListUpdate({ status: 'completed' })).not.toThrow();
  });

  it('should reject empty name if provided', () => {
    expect(() => validateShoppingListUpdate({ name: '' }))
      .toThrow(/name/i);
  });
});

describe('validateItemCreate', () => {
  it('should require name', () => {
    expect(() => validateItemCreate({}))
      .toThrow(/name/i);
  });

  it('should accept name only', () => {
    expect(() => validateItemCreate({ name: 'tomatoes' })).not.toThrow();
  });

  it('should accept all fields', () => {
    const fullItem = {
      name: 'tomatoes',
      quantity: '2 cases',
      notes: 'Roma variety'
    };
    expect(() => validateItemCreate(fullItem)).not.toThrow();
  });

  it('should reject name too long (>200)', () => {
    const longName = 'a'.repeat(201);
    expect(() => validateItemCreate({ name: longName }))
      .toThrow(/200/);
  });

  it('should reject quantity too long (>100)', () => {
    const item = {
      name: 'tomatoes',
      quantity: 'a'.repeat(101)
    };
    expect(() => validateItemCreate(item))
      .toThrow(/100/);
  });

  it('should reject notes too long (>500)', () => {
    const item = {
      name: 'tomatoes',
      notes: 'a'.repeat(501)
    };
    expect(() => validateItemCreate(item))
      .toThrow(/500/);
  });
});

describe('validateItemUpdate', () => {
  it('should accept partial updates', () => {
    expect(() => validateItemUpdate({ name: 'New Name' })).not.toThrow();
    expect(() => validateItemUpdate({ quantity: '5 lbs' })).not.toThrow();
    expect(() => validateItemUpdate({ notes: 'Some notes' })).not.toThrow();
  });

  it('should reject empty name if provided', () => {
    expect(() => validateItemUpdate({ name: '' }))
      .toThrow(/name/i);
  });
});

describe('validateUUID', () => {
  it('should accept valid UUID', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    expect(() => validateUUID(validUUID)).not.toThrow();
  });

  it('should reject invalid UUID', () => {
    expect(() => validateUUID('invalid-id'))
      .toThrow(/uuid/i);
  });

  it('should reject empty string', () => {
    expect(() => validateUUID(''))
      .toThrow(/uuid/i);
  });

  it('should reject non-string values', () => {
    expect(() => validateUUID(123 as any))
      .toThrow();
  });
});
