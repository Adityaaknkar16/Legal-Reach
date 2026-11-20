import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      
      // Save data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // REDIRECT BASED ON ROLE
      if (res.data.user.role === 'admin') {
        navigate('/admin-panel');
      } else if (res.data.user.role === 'lawyer') {
        navigate('/lawyer-dashboard');
      } else {
        navigate('/user-dashboard');
      }
      
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <div className="password-input-wrapper">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '4px' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p onClick={() => navigate('/register')}>New here? Register</p>
      </form>
    </div>
  );
};

export default Login;