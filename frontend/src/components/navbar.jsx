import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={styles.logo}>
          <span style={{ color: 'white' }}>Legal</span>
          <span style={{ color: '#3b82f6' }}>Reach</span>
        </h2>
      </Link>
      
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/service" style={styles.link}>Find Lawyers</Link>
        <Link to="/service" style={styles.link}>Services</Link>
        <Link to="/about" style={styles.link}>About Us</Link>
      </div>

      <div style={styles.auth}>
        {token && user ? (
          <>
            <span style={styles.userName}>Hello, {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.signupBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 50px',
    backgroundColor: '#0f172a',
    color: 'white',
    borderBottom: '1px solid #333'
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '30px',
  },
  link: {
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500'
  },
  auth: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  signupBtn: {
    backgroundColor: '#3b82f6',
    padding: '8px 20px',
    borderRadius: '5px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    padding: '8px 20px',
    borderRadius: '5px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  userName: {
    color: '#fbbf24',
    fontWeight: 'bold'
  }
};

export default Navbar;