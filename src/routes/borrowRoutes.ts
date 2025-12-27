import { Router } from 'express';
import { BorrowController } from '../controllers/borrowController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../utils/validation';
import { CreateBorrowRequestDto, UpdateBorrowRequestDto } from '../dto/BorrowRequestDto';

const router = Router();

// User routes
router.post(
  '/',
  authenticate,
  validateRequest(CreateBorrowRequestDto),
  BorrowController.createBorrowRequest
);
router.get('/my-requests', authenticate, BorrowController.getUserBorrowRequests);
router.get('/my-history', authenticate, BorrowController.getUserBorrowHistory);
router.get('/:id', authenticate, BorrowController.getBorrowRequestById);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  BorrowController.getAllBorrowRequests
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(UpdateBorrowRequestDto),
  BorrowController.updateBorrowRequest
);

export default router;

