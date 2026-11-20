import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertCircle, CheckCircle2, Calendar, Clock, Send } from 'lucide-react';
import './LawyerDetails.css';

const LawyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [connecting, setConnecting] = useState(false);
  const [booking, setBooking] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchLawyerDetails();
  }, [id]);

  const fetchLawyerDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/lawyers');
      const foundLawyer = response.data.find(l => l._id === id);
      setLawyer(foundLawyer);
    } catch (error) {
      console.error('Error fetching lawyer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser) {
      setStatusMessage({ type: 'error', text: 'Please log in to connect with lawyers. Redirecting...' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      setConnecting(true);
      setStatusMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/connect/send',
        { receiverId: lawyer._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMessage({ type: 'success', text: 'Connection request sent successfully! You will be notified once accepted.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Error sending connection request' });
    } finally {
      setConnecting(false);
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      setStatusMessage({ type: 'error', text: 'Please log in to book a consultation! Redirecting...' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!date || !time) {
      setStatusMessage({ type: 'error', text: 'Please select a date and time slot for your consultation.' });
      return;
    }

    try {
      setBooking(true);
      setStatusMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/appointments/book',
        {
          lawyerId: lawyer._id,
          date,
          time
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatusMessage({ type: 'success', text: 'Consultation booked successfully! Redirecting to your dashboard...' });
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 1800);
    } catch (error) {
      console.error("Booking error:", error);
      setStatusMessage({ type: 'error', text: error.response?.data?.message || "Failed to book appointment" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading lawyer details...</div>;
  }

  if (!lawyer) {
    return <div className="error-screen">Lawyer not found</div>;
  }

  return (
    <div className="details-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar" style={{ overflow: 'hidden' }}>
            {lawyer.profilePic ? (
              <img src={lawyer.profilePic} alt={lawyer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              lawyer.name.charAt(0)
            )}
          </div>
          <div className="profile-title">
            <h1>{lawyer.name}</h1>
            <p className="specialization">{lawyer.specialization}</p>
            <p className="location-text">{lawyer.city}</p>
          </div>
        </div>
        <button className="connect-btn" onClick={handleConnect} disabled={connecting} style={{ opacity: connecting ? 0.7 : 1 }}>
          {connecting ? 'Sending Request...' : 'Send Connection Request'}
        </button>
      </div>

      {statusMessage.text && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '8px',
          margin: '0 0 20px 0',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: statusMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="details-body">
        <div className="left-section">
          <div className="info-section">
            <h2>Professional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Bar Council Registration</span>
                <span className="info-value">{lawyer.barCouncilRegNumber || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">State Bar Council</span>
                <span className="info-value">{lawyer.stateBarCouncil || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Year of Enrollment</span>
                <span className="info-value">{lawyer.yearOfEnrollment || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Experience</span>
                <span className="info-value">{lawyer.experience || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact</span>
                <span className="info-value">{lawyer.phone || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{lawyer.email}</span>
              </div>
            </div>
          </div>

          {lawyer.officeAddress && (
            <div className="info-section">
              <h2>Office Address</h2>
              <p className="address-text">{lawyer.officeAddress}</p>
            </div>
          )}

          {lawyer.bio && (
            <div className="info-section">
              <h2>About</h2>
              <p className="bio-text">{lawyer.bio}</p>
            </div>
          )}

          <div className="verification-badge">
            <span className="badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Verified Advocate
            </span>
          </div>
        </div>

        <div className="booking-panel">
          <h3>Book an Appointment</h3>
          <form>
            <label>Select Date</label>
            <input 
              type="date" 
              className="booking-input" 
              onChange={(e) => setDate(e.target.value)}
            />
            
            <label>Select Time</label>
            <select 
              className="booking-input"
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Select a Slot</option>
              <option value="10:00 AM">10:00 AM - 11:00 AM</option>
              <option value="02:00 PM">02:00 PM - 03:00 PM</option>
              <option value="05:00 PM">05:00 PM - 06:00 PM</option>
            </select>
            
            <button 
              type="button" 
              className="confirm-btn" 
              onClick={handleBooking}
              disabled={booking}
              style={{ opacity: booking ? 0.7 : 1 }}
            >
              {booking ? 'Booking Slot...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetails;