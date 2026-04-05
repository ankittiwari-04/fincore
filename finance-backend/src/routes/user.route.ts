import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import authenticate from '../middleware/authenticate';
import authorizeRole from '../middleware/authorizeRole';
import { Role } from '../validators/auth.validator';

const router = Router();

// Protect all routes and restrict to ADMIN
router.use(authenticate);
router.use(authorizeRole(Role.ADMIN));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);
router.patch('/:id', userController.updateUserProfile);
router.delete('/:id', userController.deleteUser);

export default router;
