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

router.get(
  '/collections/messages/',
  isAuthenticated,
  CollectionController.getOthersRequests
);

router.get(
  '/collections/messages/your/',
  isAuthenticated,
  CollectionController.getYourRequests
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

router.post(
  '/collections/:collectionId/:projectId/request',
  isAuthenticated,
  CollectionController.sendSketchRequest
);

router.delete(
  '/collections/:collectionId/:projectId/disallow',
  isAuthenticated,
  CollectionController.declineRequest
);

export default router;
