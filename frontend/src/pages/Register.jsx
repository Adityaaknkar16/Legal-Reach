import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    specialization: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3000/api/auth/register', formData);
      setSuccess("Registration successful! OTP sent to your email.");
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error registering. User might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Create Account</h2>

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

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
        <div className="password-input-wrapper">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            onChange={handleChange} 
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
        
        <select name="role" onChange={handleChange}>
          <option value="client">I am a Client</option>
          <option value="lawyer">I am a Lawyer</option>
        </select>

        {formData.role === 'lawyer' && (
          <input name="specialization" type="text" placeholder="Specialization (e.g. Criminal, Family)" onChange={handleChange} />
        )}

        <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
        
        <p onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>
          Already have an account? Login
        </p>
        
      </form>
    </div>
  );
};

export default Register;