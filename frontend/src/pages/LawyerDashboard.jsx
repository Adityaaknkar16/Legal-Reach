import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LawyerDashboard.css';

const LawyerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const reqResponse = await axios.get('http://localhost:3000/api/connect/pending', config);
        setRequests(reqResponse.data);

        const clientResponse = await axios.get('http://localhost:3000/api/connect/my-connections', config);
        setClients(clientResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/connect/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the accepted request from the list
      setRequests(requests.filter(req => req._id !== id));
      alert("Request accepted! Client added to your list.");
    } catch (error) {
      console.error("Accept error:", error);
      alert("Failed to accept request");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // Assuming we have a reject endpoint, or we can just remove it locally
      setRequests(requests.filter(req => req._id !== id));
      alert("Request rejected.");
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚖️ Lawyer Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="section">
        <h3>📩 Incoming Connection Requests</h3>
        {requests.length === 0 ? (
          <p className="empty-state">No new requests at the moment.</p>
        ) : (
          <div className="request-list">
            {requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="request-info">
                  <h4>{req.sender?.name || "New Client"}</h4>
                  <p className="email">{req.sender?.email}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn-accept"
                    onClick={() => handleAccept(req._id)}
                  >
                    ✓ Accept
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(req._id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3>👥 My Connected Clients</h3>
        {clients.length === 0 ? (
          <p className="empty-state">You haven't accepted any clients yet.</p>
        ) : (
          <div className="client-list">
            {clients.map((client) => (
              <div key={client._id} className="client-card">
                <div className="client-avatar">
                  {client.name?.charAt(0).toUpperCase()}
                </div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <p className="email">{client.email}</p>
                </div>
                <button 
                  className="btn-chat"
                  onClick={() => navigate(`/chat?receiverId=${client._id}&receiverName=${client.name}`)}
                >
                  💬 Chat Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn-logout" onClick={() => {
        localStorage.clear();
        navigate('/login');
      }}>
        Logout
      </button>
    </div>
  );
};

export default LawyerDashboard;