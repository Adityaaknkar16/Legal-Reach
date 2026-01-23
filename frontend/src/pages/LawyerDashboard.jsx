import React, { useState } from 'react';
import './Dashboard.css';

const LawyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Dummy Data: Clients requesting appointments
  const requests = [
    { id: 1, client: "Rahul Kumar", date: "2026-01-18", time: "11:00 AM", type: "Criminal Consultation" },
    { id: 2, client: "Sneha Gupta", date: "2026-01-19", time: "04:00 PM", type: "Property Dispute" },
  ];

  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Lawyer" className="avatar-img" />
          <h3>Adv. Amit Sharma</h3>
          <p>Lawyer Account</p>
        </div>
        
        <ul className="sidebar-menu">
          <li className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
            📩 Appointment Requests
          </li>
          <li className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
            🗓️ My Schedule
          </li>
          <li className="logout-btn">🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === 'requests' && (
          <div>
            <h2>Incoming Requests</h2>
            <div className="appointments-list">
              {requests.map(req => (
                <div key={req.id} className="appointment-card">
                  <div>
                    <h3>{req.client}</h3>
                    <p className="case-type">{req.type}</p>
                    <p>📅 {req.date} at {req.time}</p>
                  </div>
                  <div className="action-buttons">
                    <button className="accept-btn">Accept</button>
                    <button className="reject-btn">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerDashboard;