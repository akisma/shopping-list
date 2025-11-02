/**
 * Validation middleware using Zod schemas
 */

import { z } from 'zod';

// Shopping List schemas
const createShoppingListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  items: z.array(z.object({
    name: z.string().min(1).max(200),
    quantity: z.string().max(100).optional(),
    notes: z.string().max(500).optional()
  })).optional()
});

const updateShoppingListSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(200, 'Name must be 200 characters or less').optional(),
  status: z.enum(['active', 'sent', 'completed']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// Item schemas
const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  quantity: z.string().max(100, 'Quantity must be 100 characters or less').optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
});

const updateItemSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(200, 'Name must be 200 characters or less').optional(),
  quantity: z.string().max(100, 'Quantity must be 100 characters or less').optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// UUID schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Validation functions
export function validateShoppingListCreate(data: unknown) {
  return createShoppingListSchema.parse(data);
}

export function validateShoppingListUpdate(data: unknown) {
  return updateShoppingListSchema.parse(data);
}

export function validateItemCreate(data: unknown) {
  return createItemSchema.parse(data);
}

export function validateItemUpdate(data: unknown) {
  return updateItemSchema.parse(data);
}

export function validateUUID(uuid: unknown) {
  return uuidSchema.parse(uuid);
}

// Export schemas for service layer use
export {
  createShoppingListSchema,
  updateShoppingListSchema,
  createItemSchema,
  updateItemSchema,
  uuidSchema
};
