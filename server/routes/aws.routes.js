import { Router } from 'express';
import * as AWSController from '../controllers/aws.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.post('/S3/sign', isAuthenticated, AWSController.signS3);
router.post('/S3/copy', isAuthenticated, AWSController.copyObjectInS3);
router.delete('/S3/:user_id?/:object_key', isAuthenticated, AWSController.deleteObjectFromS3);
router.get('/S3/objects', AWSController.listObjectsInS3ForUserRequestHandler);

export default router;
