import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LawyerDetails.css';

const LawyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
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
      alert('Please login to connect with lawyers');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/connect/send',
        { receiverId: lawyer._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Connection request sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending connection request');
    }
  };

  const handleBooking = () => {
    if (!date || !time) {
      alert("Please select a date and time!");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      lawyer: lawyer.name,
      date: date,
      time: time,
      status: "Pending"
    };

    const existingAppointments = JSON.parse(localStorage.getItem("myAppointments")) || [];
    existingAppointments.push(newAppointment);
    localStorage.setItem("myAppointments", JSON.stringify(existingAppointments));

    alert("Booking Successful! Redirecting to Dashboard...");
    navigate('/user-dashboard');
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
          <div className="profile-avatar">
            {lawyer.name.charAt(0)}
          </div>
          <div className="profile-title">
            <h1>{lawyer.name}</h1>
            <p className="specialization">{lawyer.specialization}</p>
            <p className="location-text">{lawyer.city}</p>
          </div>
        </div>
        <button className="connect-btn" onClick={handleConnect}>
          Send Connection Request
        </button>
      </div>

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
            <span className="badge-verified">✓ Verified Lawyer</span>
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
            
            <button type="button" className="confirm-btn" onClick={handleBooking}>
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetails;