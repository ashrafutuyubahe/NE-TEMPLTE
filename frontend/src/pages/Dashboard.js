import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../utils/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    returned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await borrowAPI.getMyRequests();
      const requests = Array.isArray(response.data?.borrowRequests) ? response.data.borrowRequests : [];
      
      setStats({
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        returned: requests.filter(r => r.status === 'returned').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Set default stats on error
      setStats({ pending: 0, approved: 0, returned: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>Pending Requests</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.pending}</p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3>Approved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.approved}</p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3>Returned</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.returned}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Welcome, {user.firstName} {user.lastName}!</h2>
        <p>Role: <span className="badge badge-info">{user.role}</span></p>
        <p>Email: {user.email}</p>
      </div>
    </div>
  );
};

export default Dashboard;

