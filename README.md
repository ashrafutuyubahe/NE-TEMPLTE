# Library Management System - Backend

A full-stack Library Management System backend built with Node.js, Express, TypeORM, and PostgreSQL.

## Features

### User Functions
- User registration and authentication
- Search and view available books
- Request to borrow books
- View borrowing history
- Track currently borrowed books

### Administrator Functions
- Add, update, and delete books
- Approve or reject borrowing requests
- Manage user accounts
- Track borrowed and returned books
- Monitor library operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Email Service**: Nodemailer

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=library_management

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ashraftuyubahe001@gmail.com
EMAIL_PASS=npmz zqqv ialu ggej
```

5. Create the PostgreSQL database:
```sql
CREATE DATABASE library_management;
```

6. Create an admin user (optional):
```bash
npm run create-admin
```
This will create an admin user with:
- Email: `admin@library.com`
- Password: `admin123`
**Important**: Change the password after first login!

7. Run the application:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Books (User)
- `GET /api/books` - Get all books (with search, author, category filters)
- `GET /api/books/:id` - Get book by ID

### Books (Admin)
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

### Borrow Requests (User)
- `POST /api/borrow` - Create a borrow request
- `GET /api/borrow/my-requests` - Get user's borrow requests
- `GET /api/borrow/my-history` - Get user's borrow history

### Borrow Requests (Admin)
- `GET /api/borrow` - Get all borrow requests (with status filter)
- `PUT /api/borrow/:id` - Update borrow request (approve/reject/return)

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Users (Current User)
- `GET /api/users/me` - Get current user profile

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Book (Admin)
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "description": "A classic American novel",
    "totalCopies": 10,
    "category": "Fiction",
    "publisher": "Scribner",
    "publicationYear": 1925
  }'
```

### Create Borrow Request
```bash
curl -X POST http://localhost:3000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "bookId": "book-uuid",
    "borrowDurationDays": 7
  }'
```

## Database Schema

### Users
- id (UUID)
- email (unique)
- password (hashed)
- firstName
- lastName
- role (user/admin)
- isActive
- createdAt
- updatedAt

### Books
- id (UUID)
- title
- author
- isbn (unique)
- description
- totalCopies
- availableCopies
- category
- publisher
- publicationYear
- createdAt
- updatedAt

### Borrow Requests
- id (UUID)
- userId (foreign key)
- bookId (foreign key)
- status (pending/approved/rejected/returned)
- borrowDate
- returnDate
- dueDate
- borrowDurationDays
- rejectionReason
- createdAt
- updatedAt

## Email Notifications

The system sends email notifications for:
- User registration (welcome email)
- Borrow request approval/rejection
- Return reminders (can be implemented as a scheduled job)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migration:generate` - Generate a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run create-admin` - Create default admin user

## Notes

- In development mode, TypeORM will automatically synchronize the database schema
- For production, use migrations instead of synchronize
- Make sure to change the JWT_SECRET in production
- Email service uses Gmail SMTP with app password

## Testing

After starting the server, you can test the health endpoint:
```bash
curl http://localhost:3000/health
```

## Next Steps

1. Set up your PostgreSQL database
2. Update `.env` with your database credentials
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the server
5. Test the API endpoints using Postman or curl

