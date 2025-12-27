# Postman Testing Guide

This guide will help you test the Library Management System API using Postman.

## Importing the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `postman_collection.json` file
4. The collection will be imported with all endpoints organized in folders

## Setting Up Environment Variables

The collection uses variables that you need to set:

1. Click on the collection name
2. Go to the **Variables** tab
3. Set the following variables:
   - `base_url`: `http://localhost:3000` (or your server URL)
   - `user_token`: Leave empty initially - will be filled after login
   - `admin_token`: Leave empty initially - will be filled after login

## Testing Workflow

### Step 1: Health Check
First, verify the server is running:
- Run **Health Check** request
- Should return: `{"status": "OK", "message": "Library Management System API is running"}`

### Step 2: Create Admin User (First Time Only)
If you haven't created an admin user yet:
```bash
npm run create-admin
```

### Step 3: Login as Admin
1. Run **Login Admin** request
2. Copy the `token` from the response
3. Go to collection variables and paste it into `admin_token`

### Step 4: Create Books (Admin)
1. Run **Create Book (Admin)** request
2. Copy the `book.id` from the response for later use
3. Create a few more books to test with

### Step 5: Register a Regular User
1. Run **Register User** request
2. Copy the `token` from the response
3. Go to collection variables and paste it into `user_token`

### Step 6: User Operations
1. **Get All Books** - View available books
2. **Get Book by ID** - Replace `:id` with actual book ID
3. **Create Borrow Request** - Replace `bookId` with actual book ID
4. **Get My Borrow Requests** - View your requests
5. **Get My Borrow History** - View your history

### Step 7: Admin Operations
1. **Get All Borrow Requests** - View all pending requests
2. **Approve Borrow Request** - Replace `:id` with actual request ID
3. **Get All Users** - View all registered users
4. **Update User** - Modify user details
5. **Mark as Returned** - When a book is returned

## Example JSON Payloads

### Register User
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Book
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "description": "A classic American novel",
  "totalCopies": 10,
  "category": "Fiction",
  "publisher": "Scribner",
  "publicationYear": 1925
}
```

### Create Borrow Request
```json
{
  "bookId": "book-uuid-here",
  "borrowDurationDays": 7
}
```

### Approve Borrow Request
```json
{
  "status": "approved"
}
```

### Reject Borrow Request
```json
{
  "status": "rejected",
  "rejectionReason": "Book is currently unavailable"
}
```

### Update User
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "isActive": true
}
```

## Quick Test Sequence

1. ✅ Health Check
2. ✅ Login Admin → Copy token to `admin_token`
3. ✅ Create Book → Copy book ID
4. ✅ Register User → Copy token to `user_token`
5. ✅ Get All Books (as user)
6. ✅ Create Borrow Request (as user)
7. ✅ Get All Borrow Requests (as admin)
8. ✅ Approve Borrow Request (as admin)
9. ✅ Get My Borrow Requests (as user) - Should show approved
10. ✅ Mark as Returned (as admin)

## Common Issues

### 401 Unauthorized
- Make sure you've logged in and copied the token
- Check that the token is set in the collection variables
- Verify the Authorization header format: `Bearer <token>`

### 403 Forbidden
- You're trying to access an admin-only endpoint with a user token
- Make sure you're using `admin_token` for admin endpoints

### 404 Not Found
- Check that the ID in the URL is correct
- Verify the resource exists in the database

### 400 Bad Request
- Check the JSON payload format
- Verify all required fields are present
- Check validation error messages in the response

## Tips

1. **Save Responses**: After login, save the tokens to collection variables
2. **Use Variables**: Replace hardcoded IDs with variables for easier testing
3. **Test Filters**: Try different query parameters (search, status, role, etc.)
4. **Check Email**: If email service is configured, check inbox for notifications
5. **Database State**: Use admin endpoints to check database state

## Response Examples

### Successful Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Successful Book Creation Response
```json
{
  "message": "Book created successfully",
  "book": {
    "id": "uuid-here",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "totalCopies": 10,
    "availableCopies": 10,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must be at least 6 characters long"
  ]
}
```

