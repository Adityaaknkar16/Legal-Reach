import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleClick = (role) => {
    if (role === 'lawyer') {
      navigate('/lawyer-register');
    } else {
      setSelectedRole('client');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'client' }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess("OTP sent to your email. Redirecting to verification...");
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: formData.email } });
        }, 1500);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          padding: '5px',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px'
        }}>
          <button
            type="button"
            onClick={() => handleRoleClick('client')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: selectedRole === 'client' ? '#1e3a8a' : 'transparent',
              color: selectedRole === 'client' ? 'white' : '#64748b',
              transition: 'all 0.3s'
            }}
          >
            <User size={16} /> Client
          </button>
          <button
            type="button"
            onClick={() => handleRoleClick('lawyer')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              color: '#64748b',
              transition: 'all 0.3s'
            }}
          >
            <Scale size={16} /> Lawyer
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
            <input 
              name="name" 
              placeholder="Full Name" 
              onChange={handleChange} 
              required 
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              onChange={handleChange} 
              required 
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <div className="password-input-wrapper">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                className="form-control"
                style={{ width: '100%', padding: '10px', paddingRight: '42px', borderRadius: '5px', border: '1px solid #ccc' }}
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
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '10px', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Sign Up as Client'}
          </button>
        </form>
        
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;