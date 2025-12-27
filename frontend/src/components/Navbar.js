import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div>
        <div>
          <Link to="/dashboard">Library Management</Link>
          <Link to="/books">Books</Link>
          <Link to="/my-requests">My Requests</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/books">Manage Books</Link>
              <Link to="/admin/requests">Manage Requests</Link>
              <Link to="/admin/users">Manage Users</Link>
            </>
          )}
        </div>
        <div className="navbar-right">
          <span>
            {user?.firstName} {user?.lastName} ({user?.role})
          </span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

