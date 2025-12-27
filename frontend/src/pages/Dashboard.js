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
      <div style={{ marginBottom: '32px' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--neutral-600)', fontSize: '1.125rem', marginTop: '-8px' }}>
          Overview of your library activity
        </p>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--warning-50) 0%, white 100%)',
          borderLeft: '4px solid var(--warning-500)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--neutral-800)', fontSize: '1rem', fontWeight: 600 }}>Pending Requests</h3>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--warning-600)', margin: 0, lineHeight: 1 }}>{stats.pending}</p>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '8px', margin: 0 }}>Awaiting approval</p>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--success-50) 0%, white 100%)',
          borderLeft: '4px solid var(--success-500)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--neutral-800)', fontSize: '1rem', fontWeight: 600 }}>Approved</h3>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--success-600)', margin: 0, lineHeight: 1 }}>{stats.approved}</p>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '8px', margin: 0 }}>Active borrowings</p>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)',
          borderLeft: '4px solid var(--primary-500)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--neutral-800)', fontSize: '1rem', fontWeight: 600 }}>Returned</h3>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary-600)', margin: 0, lineHeight: 1 }}>{stats.returned}</p>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '8px', margin: 0 }}>Completed requests</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Welcome, {user.firstName} {user.lastName}!</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--neutral-600)', fontWeight: 500, minWidth: '80px' }}>Role:</span>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--neutral-600)', fontWeight: 500, minWidth: '80px' }}>Email:</span>
            <span style={{ color: 'var(--neutral-700)' }}>{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

