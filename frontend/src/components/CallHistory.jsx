import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Calendar, 
  MessageSquare,
  Shield,
  Activity
} from 'lucide-react';
import './CallHistory.css';

const CallHistory = ({ currentUserId }) => {
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    completedCalls: 0,
    totalMinutes: 0,
    videoCalls: 0,
    audioCalls: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [historyRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/calls/history', config),
        axios.get('http://localhost:3000/api/calls/stats', config).catch(() => ({ data: {} }))
      ]);

      setCalls(Array.isArray(historyRes.data) ? historyRes.data : []);
      if (statsRes.data && statsRes.data.totalCalls !== undefined) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error fetching call history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '0s (Missed)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleCallBack = (participant, type) => {
    if (!participant?._id) return;
    const roomId = `${type}_${user._id}_${participant._id}_${Date.now()}`;
    navigate(`/voice-call?roomId=${roomId}&receiverId=${participant._id}&userName=${encodeURIComponent(user.name)}&callType=${type}`);
  };

  const filteredCalls = calls.filter(call => {
    if (filterType === 'video') return call.callType === 'video';
    if (filterType === 'audio') return call.callType === 'audio';
    if (filterType === 'missed') return call.status === 'missed' || call.status === 'rejected';
    return true;
  });

  return (
    <div className="call-history-container">
      {/* Activity Statistics Bar */}
      <div className="call-stats-grid">
        <div className="call-stat-card">
          <div className="stat-icon-box blue">
            <Activity size={22} />
          </div>
          <div>
            <h3>{stats.totalCalls}</h3>
            <p>Total Consultations</p>
          </div>
        </div>

        <div className="call-stat-card">
          <div className="stat-icon-box green">
            <Clock size={22} />
          </div>
          <div>
            <h3>{stats.totalMinutes} min</h3>
            <p>Consultation Time</p>
          </div>
        </div>

        <div className="call-stat-card">
          <div className="stat-icon-box purple">
            <Video size={22} />
          </div>
          <div>
            <h3>{stats.videoCalls}</h3>
            <p>Video Sessions</p>
          </div>
        </div>

        <div className="call-stat-card">
          <div className="stat-icon-box orange">
            <Phone size={22} />
          </div>
          <div>
            <h3>{stats.audioCalls}</h3>
            <p>Audio Calls</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="call-history-filter-bar">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Logs ({calls.length})
          </button>
          <button 
            className={`filter-btn ${filterType === 'video' ? 'active' : ''}`}
            onClick={() => setFilterType('video')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={14} /> Video
          </button>
          <button 
            className={`filter-btn ${filterType === 'audio' ? 'active' : ''}`}
            onClick={() => setFilterType('audio')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={14} /> Audio
          </button>
          <button 
            className={`filter-btn ${filterType === 'missed' ? 'active' : ''}`}
            onClick={() => setFilterType('missed')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PhoneMissed size={14} /> Missed / Declined
          </button>
        </div>
      </div>

      {/* Call History List */}
      {loading ? (
        <div className="call-loading">Loading consultation call logs...</div>
      ) : filteredCalls.length === 0 ? (
        <div className="call-empty-state">
          <PhoneCall size={44} className="empty-call-icon" />
          <h3>No Consultation Call Logs Yet</h3>
          <p>Your video and audio consultation sessions will automatically be logged here with duration and timestamps.</p>
        </div>
      ) : (
        <div className="calls-list">
          {filteredCalls.map((call) => {
            const callerIdStr = (call.caller?._id || call.caller)?.toString();
            const myIdStr = (user._id || currentUserId)?.toString();
            const isCaller = callerIdStr === myIdStr;
            const otherParticipant = isCaller ? call.receiver : call.caller;
            const isCompleted = call.status === 'completed';
            const isMissed = call.status === 'missed' || call.status === 'rejected';

            return (
              <div key={call._id} className="call-item-card">
                {/* Direction & Type Icon */}
                <div className={`call-type-indicator ${call.callType} ${isMissed ? 'missed' : ''}`}>
                  {isMissed ? (
                    <PhoneMissed size={20} />
                  ) : isCaller ? (
                    <PhoneOutgoing size={20} />
                  ) : (
                    <PhoneIncoming size={20} />
                  )}
                </div>

                {/* Participant Details */}
                <div className="participant-info">
                  <div className="participant-header">
                    <h4>
                      {otherParticipant?.name || 'Legal Participant'}
                      <span className="role-tag">{otherParticipant?.role || 'User'}</span>
                    </h4>
                    <span className={`call-status-badge ${call.status}`}>
                      {call.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="call-meta-details">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {call.callType === 'video' ? (
                        <><Video size={13} /> Video Consultation</>
                      ) : (
                        <><Phone size={13} /> Voice Call</>
                      )}
                    </span>
                    <span>•</span>
                    <span className="meta-time">
                      <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {new Date(call.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(call.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span className="meta-duration">
                      <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      Duration: <strong>{formatDuration(call.duration)}</strong>
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="call-item-actions">
                  <button 
                    onClick={() => handleCallBack(otherParticipant, call.callType)}
                    className="btn-call-again"
                    title={`Call again via ${call.callType}`}
                  >
                    {call.callType === 'video' ? <Video size={15} /> : <Phone size={15} />} Call
                  </button>
                  <button 
                    onClick={() => navigate(`/chat?receiverId=${otherParticipant?._id}&receiverName=${encodeURIComponent(otherParticipant?.name || 'User')}`)}
                    className="btn-open-chat"
                    title="Open message thread"
                  >
                    <MessageSquare size={15} /> Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallHistory;
