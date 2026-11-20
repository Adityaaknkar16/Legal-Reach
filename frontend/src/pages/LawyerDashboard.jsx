import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Scale, 
  Settings, 
  Inbox, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  MessageSquare, 
  Users, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  CalendarCheck 
} from 'lucide-react';
import CaseDocumentsVault from '../components/CaseDocumentsVault';
import CallHistory from '../components/CallHistory';
import './LawyerDashboard.css';

const socket = io.connect("http://localhost:3000");

const LawyerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
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

        const [reqResponse, clientResponse, apptResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/connect/pending', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:3000/api/connect/my-connections', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:3000/api/appointments/my-appointments', config).catch(() => ({ data: [] }))
        ]);

        setRequests(reqResponse.data || []);
        setClients(clientResponse.data || []);
        setAppointments(apptResponse.data || []);
        
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

  const handleAppointmentStatus = async (apptId, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:3000/api/appointments/status/${apptId}`, { status }, config);
      setAppointments(appointments.map(a => a._id === apptId ? { ...a, status } : a));
      setSuccess(`Appointment ${status}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment");
      setTimeout(() => setError(null), 3000);
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
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={28} color="#1e3a8a" /> Lawyer Dashboard
          </h1>
          <p>Welcome back, Advocate {user?.name}</p>
        </div>
        <Link to="/edit-profile" style={{
          background: '#1e3a8a',
          color: 'white',
          padding: '10px 18px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Settings size={16} /> Edit Profile & Bio
        </Link>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      <div className="section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Inbox size={18} color="#2563eb" /> Incoming Connection Requests
        </h3>
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(req._id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#2563eb" /> Scheduled Consultations ({appointments.length})
        </h3>
        {appointments.length === 0 ? (
          <p className="empty-state">No consultation appointments booked yet.</p>
        ) : (
          <div className="request-list">
            {appointments.map((appt) => (
              <div key={appt._id} className="request-card" style={{ borderLeft: appt.status === 'confirmed' ? '4px solid #16a34a' : (appt.status === 'cancelled' ? '4px solid #dc2626' : '4px solid #f59e0b') }}>
                <div className="request-info">
                  <h4>Client: {appt.client?.name || "Client"}</h4>
                  <p className="email">Email: {appt.client?.email} | Phone: {appt.client?.phone || 'Not provided'}</p>
                  <p style={{ margin: '6px 0', fontSize: '13px', color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> {appt.date} &nbsp;|&nbsp; <Clock size={14} /> {appt.time}
                  </p>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontWeight: 'bold',
                    backgroundColor: appt.status === 'confirmed' ? '#dcfce7' : (appt.status === 'cancelled' ? '#fee2e2' : '#fef3c7'),
                    color: appt.status === 'confirmed' ? '#15803d' : (appt.status === 'cancelled' ? '#b91c1c' : '#b45309')
                  }}>
                    {appt.status.toUpperCase()}
                  </span>
                </div>
                <div className="request-actions">
                  {appt.status === 'pending' && (
                    <>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAppointmentStatus(appt._id, 'confirmed')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Confirm
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleAppointmentStatus(appt._id, 'cancelled')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={14} /> Decline
                      </button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <button 
                      className="btn-chat"
                      onClick={() => navigate(`/chat?receiverId=${appt.client?._id}&receiverName=${appt.client?.name}`)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={14} /> Message Client
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#2563eb" /> My Connected Clients
        </h3>
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} /> Chat Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginTop: '24px' }}>
        <CaseDocumentsVault currentUserId={user?._id} />
      </div>

      <div className="section" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={20} color="#2563eb" /> Consultation Call Logs & Activity
        </h3>
        <CallHistory currentUserId={user?._id} />
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