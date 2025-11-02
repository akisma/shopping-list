/**
 * Shopping List Item Routes
 */

import { Router } from 'express';
import { ShoppingListItemController } from '../controllers/shopping-list-item.controller';

export function createItemRoutes(controller: ShoppingListItemController): Router {
  const router = Router({ mergeParams: true }); // Merge params from parent router

  router.post('/', controller.add);
  router.put('/:itemId', controller.update);
  router.delete('/:itemId', controller.delete);

  return router;
}
