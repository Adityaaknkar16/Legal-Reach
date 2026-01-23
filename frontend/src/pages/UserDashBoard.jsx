import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("myAppointments")) || [];
    setAppointments(savedData);
  }, []);

  return (
    <div className="dashboard-container">
      {/* ... sidebar ... */}
      
      <div className="dashboard-content">
        {activeTab === 'appointments' && (
          <div>
            <h2>My Appointments</h2>
            <div className="appointments-list">
              {appointments.length === 0 && <p>No appointments yet.</p>}

              {appointments.map(app => (
                <div key={app.id} className="appointment-card">
                  <div>
                    <h3>{app.lawyer}</h3>
                    <p>📅 {app.date} at {app.time}</p>
                  </div>
                  <span className={`status-badge ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ... profile tab ... */}
      </div>
    </div>
  );
};

export default UserDashboard;