import { Router } from 'express';
import * as AWSController from '../controllers/aws.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.post('/S3/sign', isAuthenticated, AWSController.signS3);
router.post('/S3/copy', isAuthenticated, AWSController.copyObjectInS3);
router.delete('/S3/:object_key', isAuthenticated, AWSController.deleteObjectFromS3);
router.get('/S3/:username/objects', AWSController.listObjectsInS3ForUser);

export default router;
