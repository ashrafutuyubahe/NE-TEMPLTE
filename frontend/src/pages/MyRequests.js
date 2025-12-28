import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../utils/api';

const MyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
   
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await borrowAPI.getMyRequests();
      setRequests(Array.isArray(response.data?.borrowRequests) ? response.data.borrowRequests : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
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
      <h1>My Borrow Requests</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No borrow requests</td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.book?.title || 'N/A'}</td>
                  <td>{request.book?.author || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.borrowDate ? new Date(request.borrowDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{request.returnDate ? new Date(request.returnDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{request.rejectionReason || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRequests;

