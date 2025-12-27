# Logging System Documentation

The Library Management System uses Winston for comprehensive logging of all activities. All logs are written to files in the `logs/` directory.

## Log Files Structure

The logging system creates the following log files:

### Main Log Files
- **`combined-YYYY-MM-DD.log`** - All logs (info, warn, error)
- **`error-YYYY-MM-DD.log`** - Only error level logs
- **`activity-YYYY-MM-DD.log`** - General activity logs
- **`exceptions-YYYY-MM-DD.log`** - Unhandled exceptions
- **`rejections-YYYY-MM-DD.log`** - Unhandled promise rejections

### Specialized Log Files
- **`auth-YYYY-MM-DD.log`** - Authentication activities (login, register)
- **`books-YYYY-MM-DD.log`** - Book management operations
- **`borrows-YYYY-MM-DD.log`** - Borrow request operations
- **`users-YYYY-MM-DD.log`** - User management operations

## Log Rotation

- Logs are rotated daily (new file each day)
- Maximum file size: 20MB per file
- Retention period:
  - Combined/Error logs: 14 days
  - Activity/Auth/Books/Borrows/Users logs: 30 days
  - Exceptions/Rejections: 30 days

## Log Format

All logs are in JSON format with the following structure:

```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "User logged in successfully",
  "service": "library-management",
  "type": "auth",
  "action": "login",
  "userId": "uuid-here",
  "email": "user@example.com",
  "role": "user",
  "ip": "127.0.0.1"
}
```

## Logged Activities

### Authentication
- User registration (success/failure)
- User login (success/failure)
- Failed login attempts
- Account deactivation attempts
- Email sending (success/failure)

### Books
- Book creation
- Book updates (with change details)
- Book deletion
- Book retrieval
- ISBN conflicts

### Borrow Requests
- Borrow request creation
- Request approval/rejection/return
- Status changes
- Validation failures (overdue books, unavailable books, etc.)
- Email notifications sent

### Users
- User retrieval
- User updates (with old/new data)
- User deletion
- User activation/deactivation
- Role changes

### System
- API requests (method, URL, status, duration)
- Database connection
- Server startup
- Errors and exceptions

## Log Levels

- **info** - Normal operations and successful actions
- **warn** - Warning conditions (validation failures, unauthorized access)
- **error** - Error conditions (exceptions, failures)

## Example Log Entries

### Successful Login
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "User logged in successfully",
  "action": "login",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "role": "user",
  "ip": "127.0.0.1"
}
```

### Book Created
```json
{
  "timestamp": "2024-01-15 10:35:20",
  "level": "info",
  "message": "Book created successfully",
  "action": "createBook",
  "bookId": "book-uuid",
  "bookTitle": "The Great Gatsby",
  "isbn": "978-0-7432-7356-5",
  "totalCopies": 10,
  "adminId": "admin-uuid"
}
```

### Borrow Request Approved
```json
{
  "timestamp": "2024-01-15 11:00:00",
  "level": "info",
  "message": "Borrow request status updated",
  "action": "updateBorrowRequest",
  "requestId": "request-uuid",
  "oldStatus": "pending",
  "newStatus": "approved",
  "userId": "user-uuid",
  "bookId": "book-uuid",
  "bookTitle": "The Great Gatsby",
  "adminId": "admin-uuid",
  "dueDate": "2024-01-22T00:00:00.000Z"
}
```

### Validation Failure
```json
{
  "timestamp": "2024-01-15 11:05:00",
  "level": "warn",
  "message": "Borrow request failed - user has overdue books",
  "action": "createBorrowRequest",
  "userId": "user-uuid",
  "bookId": "book-uuid"
}
```

## Accessing Logs

### View Recent Logs
```bash
# View today's combined logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# View today's error logs
tail -f logs/error-$(date +%Y-%m-%d).log

# View today's auth logs
tail -f logs/auth-$(date +%Y-%m-%d).log
```

### Search Logs
```bash
# Search for specific user actions
grep "userId.*user-uuid" logs/combined-*.log

# Search for errors
grep "\"level\":\"error\"" logs/combined-*.log

# Search for specific action
grep "\"action\":\"createBorrowRequest\"" logs/borrows-*.log
```

## Configuration

Log level can be configured via environment variable:

```env
LOG_LEVEL=info  # Options: error, warn, info, debug
```

Default log level is `info`.

## Console Output

In development mode, logs are also output to the console with color formatting for easier debugging.

## Best Practices

1. **Monitor Error Logs** - Regularly check `error-*.log` for system issues
2. **Track User Activities** - Use specialized log files (auth, books, borrows, users) for specific audits
3. **Review Validation Failures** - Check warn level logs for security concerns
4. **Archive Old Logs** - Logs older than retention period are automatically deleted
5. **Search Efficiently** - Use JSON-aware tools (jq) for complex log analysis

## Log Analysis Tools

### Using jq (JSON processor)
```bash
# Count errors by action
cat logs/error-*.log | jq -r '.action' | sort | uniq -c

# Find all failed login attempts
cat logs/auth-*.log | jq 'select(.level=="warn" and .action=="login")'

# Get all borrow approvals today
cat logs/borrows-$(date +%Y-%m-%d).log | jq 'select(.action=="updateBorrowRequest" and .newStatus=="approved")'
```

## Security Considerations

- Logs contain sensitive information (user IDs, emails, IP addresses)
- Ensure proper file permissions on the `logs/` directory
- Do not commit log files to version control (already in .gitignore)
- Regularly review and archive logs in production
- Consider encrypting logs if they contain highly sensitive data

