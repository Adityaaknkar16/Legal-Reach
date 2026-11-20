import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, User } from 'lucide-react';

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
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Scale size={24} color="#3b82f6" />
        <h2 style={styles.logo}>
          <span style={{ color: 'white' }}>Legal</span>
          <span style={{ color: '#3b82f6' }}>Reach</span>
        </h2>
      </Link>
      
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/find-lawyers" style={styles.link}>Find Lawyers</Link>
        <Link to="/service" style={styles.link}>Services</Link>
        {token && user && user.role === 'lawyer' && (
          <Link to="/lawyer-dashboard" style={styles.link}>Lawyer Dashboard</Link>
        )}
        {token && user && user.role === 'client' && (
          <Link to="/user-dashboard" style={styles.link}>My Dashboard</Link>
        )}
        {token && user && user.role === 'admin' && (
          <Link to="/admin-panel" style={styles.link}>Admin Panel</Link>
        )}
        <Link to="/about" style={styles.link}>About Us</Link>
      </div>

      <div style={styles.auth}>
        {token && user ? (
          <>
            <Link to="/edit-profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none', marginRight: '14px', fontSize: '14px', fontWeight: '500' }} title="Edit Profile">
              {user.profilePic ? (
                <img src={user.profilePic} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #3b82f6' }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="#94a3b8" />
                </div>
              )}
              <span>{user.name}</span>
            </Link>
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