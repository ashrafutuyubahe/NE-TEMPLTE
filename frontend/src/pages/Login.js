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
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '15px' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

