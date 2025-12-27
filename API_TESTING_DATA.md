# API Testing Data - Quick Reference

## Base URL
```
http://localhost:3000
```

---

## 1. Authentication

### Register User
**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Admin
**POST** `/api/auth/login`
```json
{
  "email": "admin@library.com",
  "password": "admin123"
}
```

**Response:** Copy the `token` from response and use in Authorization header as `Bearer <token>`

---

## 2. Books

### Get All Books
**GET** `/api/books`
**Headers:** `Authorization: Bearer <token>`

**Optional Query Params:**
- `?search=gatsby` - Search by title, author, or ISBN
- `?author=F. Scott Fitzgerald` - Filter by author
- `?category=Fiction` - Filter by category

### Get Book by ID
**GET** `/api/books/{book-id}`
**Headers:** `Authorization: Bearer <token>`

### Create Book (Admin)
**POST** `/api/books`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

**Full Example:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "description": "A classic American novel set in the Jazz Age",
  "totalCopies": 10,
  "category": "Fiction",
  "publisher": "Scribner",
  "publicationYear": 1925
}
```

**Minimal Example:**
```json
{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "isbn": "978-0-06-112008-4",
  "totalCopies": 5
}
```

### Update Book (Admin)
**PUT** `/api/books/{book-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "title": "The Great Gatsby (Updated)",
  "totalCopies": 15,
  "description": "Updated description"
}
```

### Delete Book (Admin)
**DELETE** `/api/books/{book-id}`
**Headers:** `Authorization: Bearer <admin-token>`

---

## 3. Borrow Requests

### Create Borrow Request
**POST** `/api/borrow`
**Headers:** 
- `Authorization: Bearer <user-token>`
- `Content-Type: application/json`

```json
{
  "bookId": "book-uuid-here",
  "borrowDurationDays": 7
}
```

**Or without duration (defaults to 7 days):**
```json
{
  "bookId": "book-uuid-here"
}
```

### Get My Borrow Requests
**GET** `/api/borrow/my-requests`
**Headers:** `Authorization: Bearer <user-token>`

### Get My Borrow History
**GET** `/api/borrow/my-history`
**Headers:** `Authorization: Bearer <user-token>`

### Get Single Borrow Request by ID
**GET** `/api/borrow/{request-id}`
**Headers:** `Authorization: Bearer <user-token>` or `Authorization: Bearer <admin-token>`

**Note:** Users can only view their own requests. Admins can view any request.

### Get All Borrow Requests (Admin)
**GET** `/api/borrow`
**Headers:** `Authorization: Bearer <admin-token>`

**Optional Query Param:**
- `?status=pending` - Filter by status (pending, approved, rejected, returned)

### Approve Borrow Request (Admin)
**PUT** `/api/borrow/{request-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "status": "approved"
}
```

### Reject Borrow Request (Admin)
**PUT** `/api/borrow/{request-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "status": "rejected",
  "rejectionReason": "Book is currently unavailable"
}
```

### Mark as Returned (Admin)
**PUT** `/api/borrow/{request-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "status": "returned"
}
```

---

## 4. Users

### Get Current User Profile
**GET** `/api/users/me`
**Headers:** `Authorization: Bearer <user-token>`

### Get All Users (Admin)
**GET** `/api/users`
**Headers:** `Authorization: Bearer <admin-token>`

**Optional Query Params:**
- `?role=user` - Filter by role (user, admin)
- `?isActive=true` - Filter by active status (true, false)

### Get User by ID (Admin)
**GET** `/api/users/{user-id}`
**Headers:** `Authorization: Bearer <admin-token>`

### Update User (Admin)
**PUT** `/api/users/{user-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "isActive": true
}
```

### Deactivate User (Admin)
**PUT** `/api/users/{user-id}`
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

```json
{
  "isActive": false
}
```

### Delete User (Admin)
**DELETE** `/api/users/{user-id}`
**Headers:** `Authorization: Bearer <admin-token>`

---

## 5. Health Check

### Health Check
**GET** `/health`
**No headers required**

---

## Quick Testing Flow

1. **Health Check** → `GET /health`
2. **Login Admin** → `POST /api/auth/login` → Copy token
3. **Create Book** → `POST /api/books` → Copy book ID
4. **Register User** → `POST /api/auth/register` → Copy token
5. **Get Books** → `GET /api/books` (as user)
6. **Create Borrow Request** → `POST /api/borrow` (as user)
7. **Get All Requests** → `GET /api/borrow` (as admin)
8. **Approve Request** → `PUT /api/borrow/{id}` (as admin)
9. **Check My Requests** → `GET /api/borrow/my-requests` (as user)

---

## Notes

- Replace `{book-id}`, `{user-id}`, `{request-id}` with actual UUIDs from responses
- Replace `<token>`, `<user-token>`, `<admin-token>` with actual JWT tokens
- All endpoints except `/health`, `/api/auth/register`, and `/api/auth/login` require Authorization header
- Format: `Authorization: Bearer <your-token-here>`
- For query parameters, add them to URL: `/api/books?search=gatsby&category=Fiction`

