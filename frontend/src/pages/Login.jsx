import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // SAVE DATA TO BROWSER
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert("Login Successful!");
        
        // Redirect based on role
        if (data.user.role === 'lawyer') {
          navigate('/lawyer-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        alert(data.message || "Login Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" onChange={handleChange} required />
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>
        <p>New here? <Link to="/signup">Create Account</Link></p>
      </div>
    </div>
  );
};

export default Login;