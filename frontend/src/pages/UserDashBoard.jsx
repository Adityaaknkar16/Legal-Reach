import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Ensure you have your CSS

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Get user data from local storage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // 2. If no user or token, kick them back to login
    if (!storedUser || !token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
      
      {/* Your other Dashboard Content goes here */}
    </div>
  );
};

export default UserDashBoard;