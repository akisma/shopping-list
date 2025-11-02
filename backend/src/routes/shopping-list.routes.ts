/**
 * Shopping List Routes
 */

import { Router } from 'express';
import { ShoppingListController } from '../controllers/shopping-list.controller';

export function createShoppingListRoutes(controller: ShoppingListController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  router.post('/:id/send', controller.send);

  return router;
}
