import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const LawyerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const reqResponse = await axios.get('http://localhost:3000/api/connect/pending', config);
        setRequests(reqResponse.data);

        const clientResponse = await axios.get('http://localhost:3000/api/connect/accepted', config);
        setClients(clientResponse.data);

      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/connect/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload(); 
    } catch (error) {
      alert("Failed to accept request");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Lawyer Dashboard</h2>

      <div className="section">
        <h3>📩 Incoming Requests</h3>
        {requests.length === 0 ? <p>No new requests.</p> : (
          <div className="card-list">
            {requests.map((req) => (
              <div key={req._id} className="card">
                <h4>{req.senderName || "New Client"}</h4>
                <button onClick={() => handleAccept(req._id)}>Accept</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3>👥 My Clients (Ready to Chat)</h3>
        {clients.length === 0 ? <p>No active clients yet.</p> : (
          <div className="card-list">
            {clients.map((client) => (
              <div key={client._id} className="card">
                <h4>{client.name}</h4>
                <button 
                  className="chat-btn"
                  onClick={() => navigate(`/chat?receiverId=${client._id}&receiverName=${client.name}`)}
                >
                  Chat Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerDashboard;