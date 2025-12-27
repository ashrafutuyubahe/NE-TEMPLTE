# Frontend Logging Guide

## Overview

The frontend includes comprehensive logging for all API calls to help identify and debug issues during integration.

## Logging Features

### 1. Automatic API Logging
- All API requests are logged with method, URL, data, and headers
- All API responses are logged with status, data, and duration
- All API errors are logged with full error details

### 2. Log Levels
- **ERROR**: Critical errors that need attention
- **WARN**: Warnings (validation errors, 4xx responses)
- **INFO**: Important events (successful operations)
- **DEBUG**: Detailed debugging information

### 3. Logging Control

By default, logging is enabled in development mode. You can control it:

```javascript
// Enable logging (even in production)
localStorage.setItem('debug', 'true');

// Disable logging
localStorage.removeItem('debug');
```

Or in browser console:
```javascript
// Enable
localStorage.setItem('debug', 'true');
location.reload();

// Disable
localStorage.removeItem('debug');
location.reload();
```

## What Gets Logged

### API Requests
- HTTP method (GET, POST, PUT, DELETE)
- Full URL
- Request data/payload
- Headers (Authorization token is sanitized)
- Timestamp

### API Responses
- HTTP status code
- Response data
- Response duration
- Success/Error status

### API Errors
- Error message
- HTTP status code
- Response data
- Network error detection
- Timeout detection
- Full error stack
- Request configuration

### User Actions
- Login attempts (success/failure)
- Book operations (create/update/delete)
- Borrow request operations
- Status changes

## Example Log Output

### Successful Request
```
[2024-01-15T10:30:45.123Z] [INFO] API Response
{
  method: "GET",
  url: "/books",
  status: 200,
  statusText: "OK",
  data: {...},
  duration: "125ms"
}
```

### Error Request
```
❌ API Error: POST /borrow
Error Details: {
  method: "POST",
  url: "/borrow",
  message: "Book is not available",
  status: 400,
  data: { message: "Book is not available..." },
  isNetworkError: false,
  duration: "45ms"
}
```

### Network Error
```
[2024-01-15T10:30:45.123Z] [ERROR] Network Error Details
{
  message: "Network error...",
  isNetworkError: true,
  code: "ECONNABORTED",
  url: "/books",
  suggestion: "Check if backend server is running on http://localhost:3000/api"
}
```

## Debugging Tips

### 1. Check Browser Console
Open Developer Tools (F12) and check the Console tab for all logs.

### 2. Filter Logs
Use browser console filters:
- Filter by "ERROR" for errors only
- Filter by "API" for API-related logs
- Filter by specific URL or method

### 3. Network Tab
Check the Network tab in Developer Tools to see:
- Actual HTTP requests
- Request/Response headers
- Response data
- Status codes

### 4. Common Issues

**Network Errors:**
- Check if backend is running
- Check API URL configuration
- Check CORS settings

**401 Unauthorized:**
- Check if token is valid
- Check if token is expired
- Check if user is logged in

**403 Forbidden:**
- Check user role
- Check if user has permission

**400 Bad Request:**
- Check validation errors in logs
- Check request data format
- Check required fields

**500 Server Error:**
- Check backend logs
- Check server status
- Check database connection

## Logging in Production

For production, you can:
1. Disable detailed logging (set `debug` to false)
2. Keep error logging enabled
3. Send error logs to error tracking service (Sentry, etc.)

## Integration with Backend Logs

Frontend logs complement backend logs:
- Frontend logs show client-side issues
- Backend logs show server-side issues
- Together they provide full request/response cycle visibility

