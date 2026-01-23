import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LawyerDetails.css';

const LawyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lawyer = {
    name: "Adv. Amit Sharma",
    specialty: "Criminal Lawyer",
    location: "Pimpri-Chinchwad, Pune",
    experience: "12 Years",
    fees: "₹2000 per consultation",
    bio: "Adv. Amit Sharma is a highly experienced criminal defense lawyer...",
    image: ""
  };

  // State for form inputs
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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

  return (
    <div className="details-container">
       <div className="profile-header">
          <img src={lawyer.image} alt={lawyer.name} className="profile-img-large" />
          <div className="profile-info">
             <h1>{lawyer.name}</h1>
          </div>
       </div>

       <div className="details-body">
         <div className="left-section">
            <h3>About Me</h3>
            <p>{lawyer.bio}</p>
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