import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../utils/api';
import logger from '../utils/logger';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await borrowAPI.getAll(params);
      setRequests(Array.isArray(response.data?.borrowRequests) ? response.data.borrowRequests : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
      setMessage(err.message || 'Failed to fetch requests');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status, rejectionReason = '') => {
    try {
      const request = requests.find(r => r.id === id);
      const updateData = { status };
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      logger.info('Updating borrow request status', {
        requestId: id,
        oldStatus: request?.status,
        newStatus: status,
        rejectionReason: rejectionReason || null,
        userId: request?.userId,
        bookId: request?.bookId,
      });

      await borrowAPI.update(id, updateData);
      
      logger.info('Borrow request status updated successfully', {
        requestId: id,
        newStatus: status,
      });

      setMessage(`Request ${status} successfully!`);
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      logger.error('Failed to update borrow request', {
        requestId: id,
        newStatus: status,
        error: err.message,
        isNetworkError: err.isNetworkError,
        isValidationError: err.isValidationError,
        validationErrors: err.validationErrors,
        status: err.status,
        responseData: err.responseData,
      });

      const errorMsg = err.message || err.response?.data?.message || 'Operation failed';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      returned: 'badge-info',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Manage Borrow Requests</h1>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '200px', display: 'inline-block', marginLeft: '10px' }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned</option>
        </select>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Status</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No requests found</td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    {request.user?.firstName} {request.user?.lastName}
                    <br />
                    <small>{request.user?.email}</small>
                  </td>
                  <td>
                    {request.book?.title}
                    <br />
                    <small>by {request.book?.author}</small>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.borrowDate ? new Date(request.borrowDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{request.returnDate ? new Date(request.returnDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {request.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleStatusChange(request.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) {
                              handleStatusChange(request.id, 'rejected', reason);
                            }
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(request.id, 'returned')}
                      >
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRequests;

