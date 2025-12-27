import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { BorrowRequest, BorrowStatus } from '../entities/BorrowRequest';
import { Book } from '../entities/Book';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth';
import { CreateBorrowRequestDto, UpdateBorrowRequestDto } from '../dto/BorrowRequestDto';
import { EmailService } from '../services/emailService';
import { borrowsLogger, logError } from '../utils/logger';

export class BorrowController {
  static async createBorrowRequest(req: AuthRequest, res: Response) {
    try {
      const createBorrowDto: CreateBorrowRequestDto = req.body;
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);
      const bookRepository = AppDataSource.getRepository(Book);
      const userRepository = AppDataSource.getRepository(User);

      // Check if user exists and is active
      const user = await userRepository.findOne({
        where: { id: req.user!.id },
      });

      if (!user) {
        borrowsLogger.warn('Borrow request failed - user not found', {
          action: 'createBorrowRequest',
          userId: req.user!.id,
          bookId: createBorrowDto.bookId,
        });
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        borrowsLogger.warn('Borrow request failed - user deactivated', {
          action: 'createBorrowRequest',
          userId: user.id,
          bookId: createBorrowDto.bookId,
        });
        return res.status(403).json({
          message: 'Your account is deactivated. Please contact administrator.',
        });
      }

      // Check if book exists
      const book = await bookRepository.findOne({
        where: { id: createBorrowDto.bookId },
      });

      if (!book) {
        borrowsLogger.warn('Borrow request failed - book not found', {
          action: 'createBorrowRequest',
          userId: user.id,
          bookId: createBorrowDto.bookId,
        });
        return res.status(404).json({ message: 'Book not found' });
      }

      // Check if book is available (has available copies)
      if (book.availableCopies <= 0) {
        borrowsLogger.warn('Borrow request failed - book not available', {
          action: 'createBorrowRequest',
          userId: user.id,
          bookId: book.id,
          bookTitle: book.title,
          availableCopies: book.availableCopies,
        });
        return res.status(400).json({
          message: 'Book is not available. All copies are currently borrowed.',
        });
      }

      // Check if book is already borrowed by this user (any status except returned)
      const existingBorrow = await borrowRepository.findOne({
        where: {
          userId: req.user!.id,
          bookId: createBorrowDto.bookId,
        },
        order: { createdAt: 'DESC' },
      });

      if (existingBorrow) {
        if (existingBorrow.status === BorrowStatus.PENDING) {
          borrowsLogger.warn('Borrow request failed - pending request exists', {
            action: 'createBorrowRequest',
            userId: user.id,
            bookId: book.id,
            existingRequestId: existingBorrow.id,
          });
          return res.status(400).json({
            message: 'You already have a pending request for this book',
          });
        }

        if (existingBorrow.status === BorrowStatus.APPROVED) {
          borrowsLogger.warn('Borrow request failed - book already borrowed', {
            action: 'createBorrowRequest',
            userId: user.id,
            bookId: book.id,
            existingRequestId: existingBorrow.id,
          });
          return res.status(400).json({
            message: 'You already have this book borrowed. Please return it first.',
          });
        }

        // If the last request was rejected, allow new request
        // If returned, allow new request
      }

      // Check if user has overdue books
      const overdueBooks = await borrowRepository.find({
        where: {
          userId: req.user!.id,
          status: BorrowStatus.APPROVED,
        },
      });

      const today = new Date();
      const hasOverdue = overdueBooks.some((borrow) => {
        if (!borrow.dueDate) return false;
        return new Date(borrow.dueDate) < today;
      });

      if (hasOverdue) {
        borrowsLogger.warn('Borrow request failed - user has overdue books', {
          action: 'createBorrowRequest',
          userId: user.id,
          bookId: book.id,
        });
        return res.status(400).json({
          message: 'You have overdue books. Please return them before borrowing new books.',
        });
      }

      // Check if there are any approved borrows for this book that haven't been returned
      // This ensures we don't allow borrowing when all copies are actually out
      const activeBorrowsForBook = await borrowRepository.count({
        where: {
          bookId: createBorrowDto.bookId,
          status: BorrowStatus.APPROVED,
        },
      });

      // Double-check availability considering actual approved borrows
      if (activeBorrowsForBook >= book.totalCopies) {
        borrowsLogger.warn('Borrow request failed - all copies borrowed', {
          action: 'createBorrowRequest',
          userId: user.id,
          bookId: book.id,
          activeBorrows: activeBorrowsForBook,
          totalCopies: book.totalCopies,
        });
        return res.status(400).json({
          message: 'All copies of this book are currently borrowed.',
        });
      }

      // Validate borrow duration
      const borrowDuration = createBorrowDto.borrowDurationDays || 7;
      if (borrowDuration < 1 || borrowDuration > 30) {
        return res.status(400).json({
          message: 'Borrow duration must be between 1 and 30 days',
        });
      }

      // Create borrow request
      const borrowRequest = borrowRepository.create({
        userId: req.user!.id,
        bookId: createBorrowDto.bookId,
        status: BorrowStatus.PENDING,
        borrowDurationDays: borrowDuration,
      });

      await borrowRepository.save(borrowRequest);

      borrowsLogger.info('Borrow request created successfully', {
        action: 'createBorrowRequest',
        requestId: borrowRequest.id,
        userId: user.id,
        userEmail: user.email,
        bookId: book.id,
        bookTitle: book.title,
        borrowDurationDays: borrowDuration,
        status: borrowRequest.status,
      });

      res.status(201).json({
        message: 'Borrow request created successfully',
        borrowRequest,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'createBorrowRequest',
        userId: req.user?.id,
        bookId: createBorrowDto.bookId,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserBorrowRequests(req: AuthRequest, res: Response) {
    try {
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);

      const borrowRequests = await borrowRepository.find({
        where: { userId: req.user!.id },
        relations: ['book'],
        order: { createdAt: 'DESC' },
      });

      res.json({
        message: 'Borrow requests retrieved successfully',
        borrowRequests,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getUserBorrowRequests',
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserBorrowHistory(req: AuthRequest, res: Response) {
    try {
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);

      const borrowHistory = await borrowRepository.find({
        where: { userId: req.user!.id },
        relations: ['book'],
        order: { createdAt: 'DESC' },
      });

      borrowsLogger.info('Borrow history retrieved', {
        action: 'getUserBorrowHistory',
        userId: req.user!.id,
        count: borrowHistory.length,
      });

      res.json({
        message: 'Borrow history retrieved successfully',
        borrowHistory,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getUserBorrowHistory',
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getBorrowRequestById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);

      const borrowRequest = await borrowRepository.findOne({
        where: { id },
        relations: ['user', 'book'],
      });

      if (!borrowRequest) {
        borrowsLogger.warn('Borrow request not found', {
          action: 'getBorrowRequestById',
          requestId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: 'Borrow request not found' });
      }

      // Users can only view their own requests, admins can view any
      if (req.user!.role !== 'admin' && borrowRequest.userId !== req.user!.id) {
        borrowsLogger.warn('Access denied to borrow request', {
          action: 'getBorrowRequestById',
          requestId: id,
          userId: req.user!.id,
          requestUserId: borrowRequest.userId,
        });
        return res.status(403).json({ message: 'Access denied' });
      }

      borrowsLogger.info('Borrow request retrieved', {
        action: 'getBorrowRequestById',
        requestId: borrowRequest.id,
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.json({
        message: 'Borrow request retrieved successfully',
        borrowRequest,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getBorrowRequestById',
        requestId: id,
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getAllBorrowRequests(req: AuthRequest, res: Response) {
    try {
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);
      const { status } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const borrowRequests = await borrowRepository.find({
        where,
        relations: ['user', 'book'],
        order: { createdAt: 'DESC' },
      });

      borrowsLogger.info('All borrow requests retrieved', {
        action: 'getAllBorrowRequests',
        adminId: req.user?.id,
        count: borrowRequests.length,
        statusFilter: status || 'all',
      });

      res.json({
        message: 'Borrow requests retrieved successfully',
        borrowRequests,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getAllBorrowRequests',
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateBorrowRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateDto: UpdateBorrowRequestDto = req.body;
      const borrowRepository = AppDataSource.getRepository(BorrowRequest);
      const bookRepository = AppDataSource.getRepository(Book);
      const userRepository = AppDataSource.getRepository(User);

      const borrowRequest = await borrowRepository.findOne({
        where: { id },
        relations: ['user', 'book'],
      });

      if (!borrowRequest) {
        return res.status(404).json({ message: 'Borrow request not found' });
      }

      const oldStatus = borrowRequest.status;
      const newStatus = updateDto.status as BorrowStatus;

      // Validate status transition
      if (updateDto.status) {
        // Validate status value
        const validStatuses = Object.values(BorrowStatus);
        if (!validStatuses.includes(newStatus)) {
          return res.status(400).json({
            message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
          });
        }

        // Validate status transitions
        if (oldStatus === BorrowStatus.RETURNED) {
          return res.status(400).json({
            message: 'Cannot change status of a returned book',
          });
        }

        if (oldStatus === BorrowStatus.APPROVED && newStatus === BorrowStatus.PENDING) {
          return res.status(400).json({
            message: 'Cannot change approved request back to pending',
          });
        }

        if (oldStatus === BorrowStatus.REJECTED && newStatus === BorrowStatus.APPROVED) {
          return res.status(400).json({
            message: 'Cannot approve a rejected request. Create a new request instead',
          });
        }

        if (newStatus === BorrowStatus.APPROVED) {
          // Check if book still exists and is available
          const book = await bookRepository.findOne({
            where: { id: borrowRequest.bookId },
          });

          if (!book) {
            return res.status(404).json({ message: 'Book not found' });
          }

          // Check if book is still available
          if (book.availableCopies <= 0) {
            return res.status(400).json({
              message: 'Book is no longer available. All copies are currently borrowed.',
            });
          }

          // Check if there are other approved borrows for this book
          // Use query builder to exclude current request
          const activeBorrowsForBook = await borrowRepository
            .createQueryBuilder('borrow')
            .where('borrow.bookId = :bookId', { bookId: borrowRequest.bookId })
            .andWhere('borrow.status = :status', { status: BorrowStatus.APPROVED })
            .andWhere('borrow.id != :currentId', { currentId: borrowRequest.id })
            .getCount();

          // Add 1 for the current request being approved
          const totalBorrowsAfterApproval = activeBorrowsForBook + 1;

          if (totalBorrowsAfterApproval > book.totalCopies) {
            return res.status(400).json({
              message: 'All copies of this book are currently borrowed',
            });
          }

          // Set borrow date and due date
          borrowRequest.borrowDate = new Date();
          const dueDate = new Date();
          dueDate.setDate(
            dueDate.getDate() + borrowRequest.borrowDurationDays
          );
          borrowRequest.dueDate = dueDate;

          // Decrease available copies
          book.availableCopies = Math.max(0, book.availableCopies - 1);
          await bookRepository.save(book);
        } else if (newStatus === BorrowStatus.REJECTED) {
          // Only allow rejecting pending requests
          if (oldStatus !== BorrowStatus.PENDING) {
            return res.status(400).json({
              message: 'Only pending requests can be rejected',
            });
          }

          borrowRequest.rejectionReason = updateDto.rejectionReason || 'No reason provided';
        } else if (newStatus === BorrowStatus.RETURNED) {
          // Only allow returning approved books
          if (oldStatus !== BorrowStatus.APPROVED) {
            return res.status(400).json({
              message: 'Only approved books can be marked as returned',
            });
          }

          // Increase available copies
          const book = await bookRepository.findOne({
            where: { id: borrowRequest.bookId },
          });
          if (book) {
            // Don't exceed total copies
            book.availableCopies = Math.min(
              book.totalCopies,
              book.availableCopies + 1
            );
            await bookRepository.save(book);
          }
          borrowRequest.returnDate = new Date();
        }

        borrowRequest.status = newStatus;
      }

      await borrowRepository.save(borrowRequest);

      // Log the status change
      if (updateDto.status && oldStatus !== updateDto.status) {
        borrowsLogger.info('Borrow request status updated', {
          action: 'updateBorrowRequest',
          requestId: borrowRequest.id,
          oldStatus,
          newStatus: updateDto.status,
          userId: borrowRequest.userId,
          bookId: borrowRequest.bookId,
          bookTitle: borrowRequest.book?.title,
          adminId: req.user?.id,
          dueDate: borrowRequest.dueDate,
          returnDate: borrowRequest.returnDate,
          rejectionReason: borrowRequest.rejectionReason,
        });

        // Send email notification if status changed
        try {
          const user = await userRepository.findOne({
            where: { id: borrowRequest.userId },
          });
          if (user && borrowRequest.book) {
            await EmailService.sendBorrowRequestEmail(
              user.email,
              user.firstName,
              borrowRequest.book.title,
              updateDto.status
            );
            borrowsLogger.info('Email notification sent', {
              action: 'updateBorrowRequest',
              requestId: borrowRequest.id,
              userId: user.id,
              email: user.email,
              status: updateDto.status,
            });
          }
        } catch (emailError) {
          logError(emailError as Error, {
            action: 'updateBorrowRequest',
            requestId: borrowRequest.id,
            context: 'Failed to send email notification',
          });
        }
      }

      res.json({
        message: 'Borrow request updated successfully',
        borrowRequest,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'updateBorrowRequest',
        requestId: id,
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

