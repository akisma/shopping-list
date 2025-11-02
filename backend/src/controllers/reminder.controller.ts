/**
 * Reminder Controller - thin adapter for Express (stub for Task 6)
 */

import type { Request, Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { validateUUID } from '../middleware/validation';
import { z } from 'zod';

const createReminderSchema = z.object({
  shoppingListId: z.string().uuid(),
  scheduledAt: z.string().datetime()
});

const updateReminderSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['pending', 'sent', 'cancelled']).optional()
});

export class ReminderController {
  constructor(private service: ReminderService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createReminderSchema.parse(req.body);
      const result = this.service.create(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateUUID(req.params.id);
      const data = updateReminderSchema.parse(req.body);
      const result = this.service.update(req.params.id, data);
      
      if (!result) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Reminder not found',
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
          message: 'Reminder not found',
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
