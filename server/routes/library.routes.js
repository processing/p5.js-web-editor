import { Router } from 'express';
import * as LibraryController from '../controllers/library.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.put('/projects/:project_id/libraries', isAuthenticated, LibraryController.addLibrary);
router.delete('/projects/:project_id/libraries/:library_name', isAuthenticated, LibraryController.removeLibrary);
router.post('/projects/:project_id/libraries', isAuthenticated, LibraryController.setLibraries);

export default router;
