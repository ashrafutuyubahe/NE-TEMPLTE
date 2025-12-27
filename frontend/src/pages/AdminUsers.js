import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import logger from '../utils/logger';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setMessage(err.message || 'Failed to fetch users');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const newStatus = !user.isActive;
      
      logger.info('Toggling user active status', {
        userId: user.id,
        userEmail: user.email,
        oldStatus: user.isActive,
        newStatus,
      });

      await userAPI.update(user.id, { isActive: newStatus });
      
      logger.info('User status updated successfully', {
        userId: user.id,
        newStatus,
      });

      setMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      logger.error('Failed to toggle user status', {
        userId: user.id,
        error: err.message,
        isNetworkError: err.isNetworkError,
        status: err.status,
        responseData: err.responseData,
      });

      const errorMsg = err.message || err.response?.data?.message || 'Operation failed';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    const confirmMessage = user 
      ? `Are you sure you want to delete ${user.firstName} ${user.lastName} (${user.email})? This action cannot be undone.`
      : 'Are you sure you want to delete this user? This action cannot be undone.';

    if (window.confirm(confirmMessage)) {
      try {
        logger.info('Deleting user', {
          userId: id,
          userEmail: user?.email,
        });

        await userAPI.delete(id);
        
        logger.info('User deleted successfully', {
          userId: id,
          userEmail: user?.email,
        });

        setMessage('User deleted successfully!');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        logger.error('Failed to delete user', {
          userId: id,
          error: err.message,
          isNetworkError: err.isNetworkError,
          status: err.status,
          responseData: err.responseData,
        });

        const errorMsg = err.message || err.response?.data?.message || 'Failed to delete user';
        setMessage(errorMsg);
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Manage Users</h1>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleActive(user)}
                    style={{ marginRight: '5px' }}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

