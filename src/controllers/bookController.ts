import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Book } from '../entities/Book';
import { AuthRequest } from '../middleware/auth';
import { CreateBookDto, UpdateBookDto } from '../dto/BookDto';
import { booksLogger, logError } from '../utils/logger';

export class BookController {
  static async getAllBooks(req: AuthRequest, res: Response) {
    try {
      const bookRepository = AppDataSource.getRepository(Book);
      const { search, author, category } = req.query;

      const queryBuilder = bookRepository.createQueryBuilder('book');

      if (search) {
        queryBuilder.where(
          '(book.title ILIKE :search OR book.author ILIKE :search OR book.isbn ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (author) {
        queryBuilder.andWhere('book.author ILIKE :author', {
          author: `%${author}%`,
        });
      }

      if (category) {
        queryBuilder.andWhere('book.category = :category', { category });
      }

      const books = await queryBuilder.getMany();

      booksLogger.info('Books retrieved', {
        action: 'getAllBooks',
        userId: req.user?.id,
        userRole: req.user?.role,
        count: books.length,
        filters: { search, author, category },
      });

      res.json({
        message: 'Books retrieved successfully',
        books,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getAllBooks',
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getBookById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const bookRepository = AppDataSource.getRepository(Book);

      const book = await bookRepository.findOne({
        where: { id },
        relations: ['borrowRequests'],
      });

      if (!book) {
        booksLogger.warn('Book not found', {
          action: 'getBookById',
          bookId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: 'Book not found' });
      }

      booksLogger.info('Book retrieved', {
        action: 'getBookById',
        bookId: book.id,
        bookTitle: book.title,
        userId: req.user?.id,
      });

      res.json({
        message: 'Book retrieved successfully',
        book,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'getBookById',
        bookId: id,
        userId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createBook(req: AuthRequest, res: Response) {
    try {
      const createBookDto: CreateBookDto = req.body;
      const bookRepository = AppDataSource.getRepository(Book);

      // Check if ISBN already exists
      const existingBook = await bookRepository.findOne({
        where: { isbn: createBookDto.isbn },
      });

      if (existingBook) {
        booksLogger.warn('Book creation failed - ISBN exists', {
          action: 'createBook',
          isbn: createBookDto.isbn,
          adminId: req.user?.id,
        });
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
      }

      const book = bookRepository.create({
        ...createBookDto,
        availableCopies: createBookDto.totalCopies,
      });

      await bookRepository.save(book);

      booksLogger.info('Book created successfully', {
        action: 'createBook',
        bookId: book.id,
        bookTitle: book.title,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
        adminId: req.user?.id,
      });

      res.status(201).json({
        message: 'Book created successfully',
        book,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'createBook',
        adminId: req.user?.id,
        bookData: createBookDto,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateBook(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateBookDto: UpdateBookDto = req.body;
      const bookRepository = AppDataSource.getRepository(Book);

      const book = await bookRepository.findOne({ where: { id } });

      if (!book) {
        booksLogger.warn('Book update failed - not found', {
          action: 'updateBook',
          bookId: id,
          adminId: req.user?.id,
        });
        return res.status(404).json({ message: 'Book not found' });
      }

      const oldData = { ...book };

      // If totalCopies is being updated, adjust availableCopies
      if (updateBookDto.totalCopies !== undefined) {
        const difference = updateBookDto.totalCopies - book.totalCopies;
        book.availableCopies = Math.max(0, book.availableCopies + difference);
      }

      Object.assign(book, updateBookDto);
      await bookRepository.save(book);

      booksLogger.info('Book updated successfully', {
        action: 'updateBook',
        bookId: book.id,
        bookTitle: book.title,
        changes: updateBookDto,
        oldData: {
          totalCopies: oldData.totalCopies,
          availableCopies: oldData.availableCopies,
        },
        newData: {
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
        },
        adminId: req.user?.id,
      });

      res.json({
        message: 'Book updated successfully',
        book,
      });
    } catch (error) {
      logError(error as Error, {
        action: 'updateBook',
        bookId: id,
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteBook(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const bookRepository = AppDataSource.getRepository(Book);

      const book = await bookRepository.findOne({ where: { id } });

      if (!book) {
        booksLogger.warn('Book deletion failed - not found', {
          action: 'deleteBook',
          bookId: id,
          adminId: req.user?.id,
        });
        return res.status(404).json({ message: 'Book not found' });
      }

      const bookData = {
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
      };

      await bookRepository.remove(book);

      booksLogger.info('Book deleted successfully', {
        action: 'deleteBook',
        bookId: bookData.id,
        bookTitle: bookData.title,
        isbn: bookData.isbn,
        adminId: req.user?.id,
      });

      res.json({
        message: 'Book deleted successfully',
      });
    } catch (error) {
      logError(error as Error, {
        action: 'deleteBook',
        bookId: id,
        adminId: req.user?.id,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

