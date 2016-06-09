import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
const router = new Router();

router.route('/signup').get(UserController.newUser);

router.route('/signup').post(UserController.createUser);

export default router;