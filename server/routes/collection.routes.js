import { Router } from 'express';
import * as CollectionController from '../controllers/collection.controller';

const router = new Router();

router.route('/collections').post(CollectionController.createCollection);

router.route('/collections/:collection_id').put(CollectionController.updateCollection);

router.route('/collections/:collection_id').get(CollectionController.getCollection);

router.route('/collections/:collection_id').delete(CollectionController.deleteCollection);

router.route('/collections').get(CollectionController.getCollection);

router.route('/:username/collections').get(CollectionController.getCollectionsForUser);

export default router;
