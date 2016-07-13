import { Router } from 'express';
import * as FileController from '../controllers/file.controller';

const router = new Router();

router.route('/projects/:project_id/files').post(FileController.createFile);

export default router;