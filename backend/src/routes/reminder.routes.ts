/**
 * Reminder Routes (stub for Task 6)
 */

import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';

export function createReminderRoutes(controller: ReminderController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
