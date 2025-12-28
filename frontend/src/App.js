import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import MyRequests from './pages/MyRequests';
import AdminBooks from './pages/AdminBooks';
import AdminRequests from './pages/AdminRequests';
import AdminUsers from './pages/AdminUsers';
import { getToken, getUser } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData && userData.id && userData.email) {
      setUser(userData);
    } else {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Landing /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/books" 
            element={user ? <Books user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-requests" 
            element={user ? <MyRequests user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/books" 
            element={user?.role === 'admin' ? <AdminBooks /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/requests" 
            element={user?.role === 'admin' ? <AdminRequests /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/users" 
            element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/dashboard" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

