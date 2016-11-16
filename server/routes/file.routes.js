import { Router } from 'express';
import * as FileController from '../controllers/file.controller';

const router = new Router();

router.route('/projects/:project_id/files').post(FileController.createFile);
router.route('/projects/:project_id/files/:file_id').delete(FileController.deleteFile);
router.route('/projects/:project_id/*?').get(FileController.getFileContent);

export default router;