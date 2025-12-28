import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { generateToken } from '../utils/jwt';
import { EmailService } from '../services/emailService';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';
import { authLogger, logError } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const registerDto: RegisterDto = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        authLogger.warn('Registration attempt with existing email', {
          action: 'register',
          email: registerDto.email,
          ip: req.ip,
        });
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = userRepository.create({
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.USER,
      });

      await userRepository.save(user);

      try {
        await EmailService.sendWelcomeEmail(user.email, user.firstName);
        authLogger.info('Welcome email sent', {
          action: 'register',
          userId: user.id,
          email: user.email,
        });
      } catch (emailError) {
        logError(emailError as Error, {
          action: 'register',
          userId: user.id,
          email: user.email,
          context: 'Failed to send welcome email',
        });
      }
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      authLogger.info('User registered successfully', {
        action: 'register',
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ip: req.ip,
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      logError(error as Error, {
        action: 'register',
        email: RegisterDto.email,
        ip: req.ip,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const loginDto: LoginDto = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        authLogger.warn('Login attempt with non-existent email', {
          action: 'login',
          email: loginDto.email,
          ip: req.ip,
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        authLogger.warn('Login attempt with deactivated account', {
          action: 'login',
          userId: user.id,
          email: user.email,
          ip: req.ip,
        });
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      const isValidPassword = await bcrypt.compare(
        loginDto.password,
        user.password
      );

      if (!isValidPassword) {
        authLogger.warn('Login attempt with invalid password', {
          action: 'login',
          userId: user.id,
          email: user.email,
          ip: req.ip,
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      authLogger.info('User logged in successfully', {
        action: 'login',
        userId: user.id,
        email: user.email,
        role: user.role,
        ip: req.ip,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      logError(error as Error, {
        action: 'login',
        email: LoginDto.email,
        ip: req.ip,
      });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

