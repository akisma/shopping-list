/**
 * Shopping List Controller - thin adapter between HTTP and service layer
 */

import type { Request, Response, NextFunction } from 'express';
import type { ShoppingListService } from '../services/shopping-list.service';
import {
  validateShoppingListCreate,
  validateShoppingListUpdate,
  validateUUID
} from '../middleware/validation';

export class ShoppingListController {
  constructor(private service: ShoppingListService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validateShoppingListCreate(req.body);
      const result = this.service.create(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const result = this.service.getAll(status ? { status } : undefined);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.id);
      const result = this.service.getById(req.params.id);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Shopping list not found',
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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.id);
      const data = validateShoppingListUpdate(req.body);
      const result = this.service.update(req.params.id, data);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Shopping list not found',
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
      validateUUID(req.params.id);
      const result = this.service.delete(req.params.id);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Shopping list not found',
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      res.status(200).json({ message: 'Shopping list deleted successfully' });
    } catch (err) {
      next(err);
    }
  };

  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.id);
      const result = this.service.send(req.params.id, req.body);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Shopping list not found',
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
}
