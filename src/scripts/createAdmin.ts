import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@library.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@library.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully!');
    console.log('Email: admin@library.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

