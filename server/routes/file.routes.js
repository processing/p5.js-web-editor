import { Router } from 'express';
import * as FileController from '../controllers/file.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.post('/projects/:project_id/files', isAuthenticated, FileController.createFile);
router.delete('/projects/:project_id/files/:file_id', isAuthenticated, FileController.deleteFile);
router.put('/projects/:project_id/files/:file_id', isAuthenticated, FileController.updateFileName);


export default router;
