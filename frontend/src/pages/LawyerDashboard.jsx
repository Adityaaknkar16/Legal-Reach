import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './LawyerDashboard.css';

const socket = io.connect("http://localhost:3000");

const LawyerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      socket.emit("join_room", user._id);

      socket.on("incoming_call_notification", (data) => {
        const accept = window.confirm(`${data.callerName} is calling you (${data.callType}). Accept?`);
        if (accept) {
          navigate(`/voice-call?roomId=${data.roomId}&userName=${user.name}&callType=${data.callType}`);
        }
      });

      return () => {
        socket.off("incoming_call_notification");
      };
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const reqResponse = await axios.get('http://localhost:3000/api/connect/pending', config);
        setRequests(reqResponse.data || []);

        const clientResponse = await axios.get('http://localhost:3000/api/connect/my-connections', config);
        setClients(clientResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setError(error.response?.data?.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleAccept = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/connect/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequests(requests.filter(req => req._id !== id));
      
      const clientResponse = await axios.get('http://localhost:3000/api/connect/my-connections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clientResponse.data || []);
      
      setSuccess("Request accepted! You can now chat with this client.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Accept error:", error);
      setError(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/connect/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(req => req._id !== id));
      setSuccess("Request rejected.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Reject error:", error);
      setError(error.response?.data?.message || "Failed to reject request");
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

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

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