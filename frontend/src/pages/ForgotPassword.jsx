import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setSuccess(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword
      });

      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="card-header">
          <div className="icon-badge">
            <KeyRound size={28} />
          </div>
          <h2>Reset Your Password</h2>
          <p>
            {step === 1 
              ? "Enter your registered email and we'll send you an OTP to reset your password." 
              : `Enter the 6-digit code sent to ${email} along with your new password.`}
          </p>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}
        {success && (
          <div className="alert-box alert-success">
            <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="reset-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="form-group">
              <label>6-Digit Verification Code (OTP)</label>
              <input
                type="text"
                placeholder="e.g. 123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              className="resend-btn"
              onClick={handleSendOtp}
              disabled={loading}
            >
              Didn't receive the code? Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
