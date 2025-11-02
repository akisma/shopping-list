/**
 * Shopping List Item Controller - thin adapter for Express
 */

import type { Request, Response, NextFunction } from 'express';
import { ShoppingListItemService } from '../services/shopping-list-item.service';
import { validateItemCreate, validateItemUpdate, validateUUID } from '../middleware/validation';

export class ShoppingListItemController {
  constructor(private service: ShoppingListItemService) {}

  add = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.listId);
      const data = validateItemCreate(req.body);
      const result = this.service.add(req.params.listId, data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.listId);
      validateUUID(req.params.itemId);
      const data = validateItemUpdate(req.body);
      const result = this.service.update(req.params.listId, req.params.itemId, data);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Item not found',
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.listId);
      validateUUID(req.params.itemId);
      const result = this.service.delete(req.params.listId, req.params.itemId);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Item not found',
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
