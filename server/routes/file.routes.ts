import { Router } from 'express';
import * as FileController from '../controllers/file.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = Router();

router.post(
  '/projects/:project_id/files',
  isAuthenticated,
  FileController.createFile
);
router.delete(
  '/projects/:project_id/files/:file_id',
  isAuthenticated,
  FileController.deleteFile
);

// eslint-disable-next-line import/no-default-export
export default router;
