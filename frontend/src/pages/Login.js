import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import logger from '../utils/logger';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    logger.info('Login attempt', {
      email: formData.email,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.data?.user && response.data?.token) {
        logger.info('Login successful', {
          userId: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
        });
        
        onLogin(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        logger.error('Invalid login response', {
          hasUser: !!response.data?.user,
          hasToken: !!response.data?.token,
          responseData: response.data,
        });
        setError('Invalid response from server');
      }
    } catch (err) {
      logger.error('Login failed', {
        email: formData.email,
        error: err.message,
        isNetworkError: err.isNetworkError,
        status: err.status,
        responseData: err.responseData,
      });

      let errorMsg = err.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      
      if (err.isNetworkError) {
        errorMsg = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
      }
      
      setError(errorMsg);
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
          <h2 style={{ marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.9375rem' }}>
            Sign in to access your library account
          </p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--neutral-600)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ 
              color: 'var(--primary-600)', 
              textDecoration: 'none', 
              fontWeight: 500 
            }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

