# Library Management System - Frontend

React frontend for the Library Management System.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- User authentication (Login/Register)
- Book browsing and searching
- Borrow request creation
- View personal borrow requests
- Admin panel for:
  - Book management (CRUD)
  - Borrow request management (approve/reject/return)
  - User management

## Default Admin Credentials

After running `npm run create-admin` in the backend:
- Email: `admin@library.com`
- Password: `admin123`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Books.js
│   │   ├── MyRequests.js
│   │   ├── AdminBooks.js
│   │   ├── AdminRequests.js
│   │   └── AdminUsers.js
│   ├── utils/
│   │   ├── api.js
│   │   └── auth.js
│   ├── App.js
│   ├── index.js
│   └── index.css
└── package.json
```

