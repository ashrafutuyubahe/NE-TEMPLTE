import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      if (response.data?.user && response.data?.token) {
        onLogin(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      let errorMsg = err.message || err.response?.data?.message || 'Registration failed';
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.join(', ');
      }
      setError(errorMsg);
      if (err.isNetworkError) {
        setError('Cannot connect to server. Please ensure the backend is running on http://localhost:3000');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: 'calc(100vh - 200px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '440px', 
        width: '100%',
        margin: '0 auto',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.9375rem' }}>
            Sign up to start using the library system
          </p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--neutral-600)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--primary-600)', 
              textDecoration: 'none', 
              fontWeight: 500 
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

