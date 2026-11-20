import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Scale, 
  FolderOpen, 
  Phone, 
  Settings, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus 
} from 'lucide-react';
import CaseDocumentsVault from '../components/CaseDocumentsVault';
import CallHistory from '../components/CallHistory';
import './UserDashboard.css';

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [apptRes, connRes] = await Promise.all([
        axios.get('http://localhost:3000/api/appointments/my-appointments', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/connect/my-connections', config).catch(() => ({ data: [] }))
      ]);

      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
      setConnections(Array.isArray(connRes.data) ? connRes.data : []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:3000/api/appointments/status/${apptId}`, { status: 'cancelled' }, config);
      setStatusMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
      fetchDashboardData();
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || "Failed to cancel appointment" });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge badge-confirmed">Confirmed</span>;
      case 'cancelled':
        return <span className="status-badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge badge-pending">Pending Review</span>;
    }
  };

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <div>
          <h1>Welcome, {user?.name || 'Client'}</h1>
          <p>Manage your booked legal consultations and active lawyer connections</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/edit-profile" style={{
            background: 'white',
            border: '1px solid #cbd5e1',
            color: '#334155',
            padding: '12px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Settings size={15} /> Edit Profile
          </Link>
          <Link to="/find-lawyers" className="dashboard-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Book New Consultation
          </Link>
        </div>
      </div>

      {statusMessage.text && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
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

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={16} /> My Appointments ({appointments.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Scale size={16} /> Connected Lawyers ({connections.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <FolderOpen size={16} /> Case Documents Vault
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Phone size={16} /> Call History
        </button>
      </div>

      {loading ? (
        <div className="dashboard-loading">Loading your dashboard...</div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 'appointments' && (
            <div className="appointments-section">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <h3>No Appointments Booked Yet</h3>
                  <p>Browse verified lawyers and book your first legal consultation.</p>
                  <Link to="/find-lawyers" className="btn-primary">Find a Lawyer</Link>
                </div>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appt) => (
                    <div key={appt._id} className="appointment-card">
                      <div className="card-top">
                        <h3>Adv. {appt.lawyer?.name || 'Legal Counsel'}</h3>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="specialization-text">{appt.lawyer?.specialization || 'General Legal Practice'}</p>
                      
                      <div className="appointment-meta">
                        <div className="meta-item">
                          <strong>Date:</strong> {appt.date}
                        </div>
                        <div className="meta-item">
                          <strong>Time Slot:</strong> {appt.time}
                        </div>
                        {appt.lawyer?.city && (
                          <div className="meta-item">
                            <strong>City:</strong> {appt.lawyer.city}
                          </div>
                        )}
                        {appt.lawyer?.officeAddress && (
                          <div className="meta-item">
                            <strong>Office:</strong> {appt.lawyer.officeAddress}
                          </div>
                        )}
                      </div>

                      <div className="card-actions">
                        <Link 
                          to={`/chat?receiverId=${appt.lawyer?._id}&receiverName=${encodeURIComponent(appt.lawyer?.name || 'Lawyer')}`}
                          className="btn-chat"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <MessageSquare size={14} /> Chat & Documents
                        </Link>
                        {appt.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelAppointment(appt._id)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="connections-section">
              {connections.length === 0 ? (
                <div className="empty-state">
                  <h3>No Connected Lawyers</h3>
                  <p>Send connection requests to lawyers from their profile to start chatting and consultations.</p>
                  <Link to="/find-lawyers" className="btn-primary">Browse Directory</Link>
                </div>
              ) : (
                <div className="connections-grid">
                  {connections.map((lawyer) => (
                    <div key={lawyer._id} className="connection-card">
                      <div className="connection-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scale size={20} color="#1e3a8a" />
                      </div>
                      <div className="connection-info">
                        <h3>{lawyer.name}</h3>
                        <p>{lawyer.email}</p>
                        <span className="badge-role">{lawyer.role}</span>
                      </div>
                      <div className="connection-actions">
                        <Link 
                          to={`/chat?receiverId=${lawyer._id}&receiverName=${encodeURIComponent(lawyer.name)}`}
                          className="btn-chat"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <MessageSquare size={14} /> Open Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vault' && (
            <CaseDocumentsVault currentUserId={user?._id} />
          )}

          {activeTab === 'calls' && (
            <CallHistory currentUserId={user?._id} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
