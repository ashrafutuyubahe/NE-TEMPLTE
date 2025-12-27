import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          marginBottom: '24px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          textShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          Library Management System
        </h1>
        <p style={{ 
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
          marginBottom: '48px', 
          opacity: 0.95,
          lineHeight: 1.6,
          fontWeight: 300
        }}>
          Manage your library efficiently. Browse books, borrow resources, and track your reading history with ease.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
          <Link 
            to="/login" 
            style={{
              padding: '16px 48px',
              backgroundColor: 'white',
              color: '#4F46E5',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            style={{
              padding: '16px 48px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Register
          </Link>
        </div>
        <div style={{ 
          marginTop: '60px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '32px',
          padding: '40px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '24px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ padding: '20px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}></div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 600 }}>Browse Books</h3>
            <p style={{ opacity: 0.9, fontSize: '0.9375rem', lineHeight: 1.6 }}>Search and explore our extensive collection of books</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}></div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 600 }}>Borrow Books</h3>
            <p style={{ opacity: 0.9, fontSize: '0.9375rem', lineHeight: 1.6 }}>Request books and track your borrowings seamlessly</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}></div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 600 }}>Manage Account</h3>
            <p style={{ opacity: 0.9, fontSize: '0.9375rem', lineHeight: 1.6 }}>View your history and manage requests efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

