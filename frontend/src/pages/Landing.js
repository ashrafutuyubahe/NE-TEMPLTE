import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Library Management System
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.9 }}>
          Manage your library efficiently. Browse books, borrow resources, and track your reading history.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/login" 
            style={{
              padding: '15px 40px',
              backgroundColor: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            style={{
              padding: '15px 40px',
              backgroundColor: 'transparent',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '2px solid white',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Register
          </Link>
        </div>
        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ marginBottom: '10px' }}>📚 Browse Books</h3>
            <p style={{ opacity: 0.8 }}>Search and explore our extensive collection</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '10px' }}>📖 Borrow Books</h3>
            <p style={{ opacity: 0.8 }}>Request books and track your borrowings</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '10px' }}>👤 Manage Account</h3>
            <p style={{ opacity: 0.8 }}>View your history and manage requests</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

