import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import './Login.css';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.message || "Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={24} />
          </div>
        </div>
        <h2>Verify Your Email</h2>
        <p style={{marginBottom: '15px'}}>Please enter the 6-digit verification code sent to your email.</p>

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
            marginBottom: '16px',
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
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>OTP Code</label>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required 
              maxLength="6"
              className="form-control"
              style={{ width: '100%', padding: '10px', textAlign: 'center', letterSpacing: '6px', fontSize: '18px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;