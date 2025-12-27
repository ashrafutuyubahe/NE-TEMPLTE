import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();

// Get current user profile
router.get('/me', authenticate, UserController.getCurrentUser);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getAllUsers
);
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getUserById
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.updateUser
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.deleteUser
);

export default router;

