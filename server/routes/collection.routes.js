import { Router } from 'express';
import * as CollectionController from '../controllers/collection.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

// List collections
router.get(
  '/collections',
  isAuthenticated,
  CollectionController.listCollections
);
router.get('/:username/collections', CollectionController.listCollections);

// Create, modify, delete collection
router.post(
  '/collections',
  isAuthenticated,
  CollectionController.createCollection
);
router.patch(
  '/collections/:id',
  isAuthenticated,
  CollectionController.updateCollection
);
router.delete(
  '/collections/:id',
  isAuthenticated,
  CollectionController.removeCollection
);

// Add and remove projects to collection
router.post(
  '/collections/:id/:projectId',
  isAuthenticated,
  CollectionController.addProjectToCollection
);
router.delete(
  '/collections/:id/:projectId',
  isAuthenticated,
  CollectionController.removeProjectFromCollection
);

export default router;
