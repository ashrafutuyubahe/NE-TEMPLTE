import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validateRequest } from '../utils/validation';
import { CreateBookDto, UpdateBookDto } from '../dto/BookDto';

const router = Router();

// Public routes (authenticated users can view books)
router.get('/', authenticate, BookController.getAllBooks);
router.get('/:id', authenticate, BookController.getBookById);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(CreateBookDto),
  BookController.createBook
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(UpdateBookDto),
  BookController.updateBook
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  BookController.deleteBook
);

export default router;

