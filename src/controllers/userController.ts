import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { BorrowRequest, BorrowStatus } from '../entities/BorrowRequest';
import { Book } from '../entities/Book';
import { AuthRequest } from '../middleware/auth';
import { usersLogger, logError } from '../utils/logger';
import { EmailService } from '../services/emailService';

export class UserController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { role, isActive } = req.query;

      const where: any = {};
      if (role) {
        where.role = role;
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const users = await userRepository.find({
        where,
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
        order: { createdAt: 'DESC' },
      });

      usersLogger.info('Users retrieved', {
        action: 'getAllUsers',
        adminId: req.user?.id,
        count: users.length,
        filters: { role, isActive },
      });

      res.json({
        message: 'Users retrieved successfully',
        users,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getAllUsers',
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
        relations: ['borrowRequests', 'borrowRequests.book'],
      });

      if (!user) {
        usersLogger.warn('User not found', {
          action: 'getUserById',
          userId: id,
          adminId: req.user?.id,
        });
        return res.status(404).json({ message: 'User not found' });
      }

      usersLogger.info('User retrieved', {
        action: 'getUserById',
        userId: user.id,
        userEmail: user.email,
        adminId: req.user?.id,
      });

      res.json({
        message: 'User retrieved successfully',
        user,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, isActive, password } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        usersLogger.warn('User update failed - not found', {
          action: 'updateUser',
          userId: id,
          adminId: req.user?.id,
        });
        return res.status(404).json({ message: 'User not found' });
      }

      if (role && req.user!.role !== UserRole.ADMIN) {
        usersLogger.warn('Unauthorized role change attempt', {
          action: 'updateUser',
          userId: id,
          adminId: req.user?.id,
        });
        return res.status(403).json({ message: 'Only admin can change user role' });
      }

      const oldData = {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      };

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (role && req.user!.role === UserRole.ADMIN) {
        user.role = role as UserRole;
      }
      if (isActive !== undefined && req.user!.role === UserRole.ADMIN) {
        user.isActive = isActive;
      }
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await userRepository.save(user);

      usersLogger.info('User updated successfully', {
        action: 'updateUser',
        userId: user.id,
        userEmail: user.email,
        oldData,
        newData: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        },
        passwordChanged: !!password,
        adminId: req.user?.id,
      });

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const borrowRepository = AppDataSource.getRepository(BorrowRequest);

    try {
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        usersLogger.warn('User deletion failed - not found', {
          action: 'deleteUser',
          userId: id,
          adminId: req.user?.id,
        });
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.id === req.user!.id) {
        usersLogger.warn('User attempted to delete own account', {
          action: 'deleteUser',
          userId: user.id,
          adminId: req.user?.id,
        });
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const borrowRequests = await borrowRepository.find({
        where: { userId: id },
      });

      if (borrowRequests.length > 0) {
        const approvedRequests = borrowRequests.filter(
          (req) => req.status === BorrowStatus.APPROVED
        );

        if (approvedRequests.length > 0) {
          const bookRepository = AppDataSource.getRepository(Book);

          for (const request of approvedRequests) {
            try {
              const book = await bookRepository.findOne({
                where: { id: request.bookId },
              });
              if (book) {
                book.availableCopies = Math.min(
                  book.totalCopies,
                  book.availableCopies + 1
                );
                await bookRepository.save(book);
                usersLogger.info('Book returned due to user deletion', {
                  action: 'deleteUser',
                  bookId: book.id,
                  bookTitle: book.title,
                  userId: id,
                });
              }
              } catch (bookError) {
              usersLogger.warn('Failed to return book during user deletion', {
                action: 'deleteUser',
                bookId: request.bookId,
                userId: id,
                error: (bookError as Error).message,
              });
            }
          }
        }

        try {
          await borrowRepository.remove(borrowRequests);
          usersLogger.info('Deleted all associated borrow requests', {
            action: 'deleteUser',
            userId: id,
            deletedRequestsCount: borrowRequests.length,
            approvedRequestsCount: approvedRequests.length,
          });
        } catch (deleteError) {
          usersLogger.warn('Failed to delete borrow request history', {
            action: 'deleteUser',
            userId: id,
            error: (deleteError as Error).message,
          });
        }
      }

      try {
        await EmailService.sendAccountDeletionEmail(
          userData.email,
          userData.firstName
        );
        usersLogger.info('Account deletion email sent', {
          action: 'deleteUser',
          userId: userData.id,
          email: userData.email,
        });
      } catch (emailError) {
        logError(emailError as Error, {
          action: 'deleteUser',
          userId: userData.id,
          context: 'Failed to send account deletion email',
        });
        usersLogger.warn('Account deletion email failed, but user deletion will proceed', {
          action: 'deleteUser',
          userId: userData.id,
          email: userData.email,
        });
      }

      await userRepository.remove(user);

      usersLogger.info('User deleted successfully', {
        action: 'deleteUser',
        deletedUserId: userData.id,
        deletedUserEmail: userData.email,
        deletedUserRole: userData.role,
        adminId: req.user?.id,
      });

      res.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates foreign key')) {
        usersLogger.error('User deletion failed - foreign key constraint', {
          action: 'deleteUser',
          userId: id,
          error: errorMessage,
          adminId: req.user?.id,
        });
        return res.status(400).json({
          message: 'Cannot delete user. This user has associated borrow records. Please ensure all borrow requests are handled first.',
        });
      }

      logError(error as Error, {
        action: 'deleteUser',
        userId: id,
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: req.user!.id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      });

      if (!user) {
        usersLogger.warn('Current user not found', {
          action: 'getCurrentUser',
          userId: req.user!.id,
        });
        return res.status(404).json({ message: 'User not found' });
      }

      usersLogger.info('Current user profile retrieved', {
        action: 'getCurrentUser',
        userId: user.id,
        userEmail: user.email,
      });

      res.json({
        message: 'User retrieved successfully',
        user,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getCurrentUser',
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

