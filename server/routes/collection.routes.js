import { Router } from 'express';
import * as CollectionController from '../controllers/collection.controller';

const router = new Router();

router.route('/collections').post(CollectionController.createCollection);

router.route('/collections/:collection_id').put(CollectionController.updateCollection);

router.route('/collections/:collection_id').get(CollectionController.getCollection);

router.route('/collections/:collection_id').delete(CollectionController.deleteCollection);

router.route('/collections').get(CollectionController.getCollection);

router.route('/:username/my-collections').get(CollectionController.getCollectionsOwnedByUser);

router.route('/:username/collections-im-in').get(CollectionController.getCollectionsUserIsMemberOf);

router.route('/:username/:collection_id/zip').get(CollectionController.downloadCollectionAsZip);

export default router;
