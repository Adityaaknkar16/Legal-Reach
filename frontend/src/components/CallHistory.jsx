import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CallHistory.css';

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/calls/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCalls(res.data);
      } catch (err) {
        console.error("Failed to load call history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="call-history-container">
      <h3>Recent Calls</h3>
      {calls.length === 0 ? (
        <p className="no-calls">No recent calls</p>
      ) : (
        <div className="call-list">
          {calls.map((call) => {
            const isCaller = call.callerId._id === user._id;
            const otherPerson = isCaller ? call.receiverId : call.callerId;
            const isMissed = call.status === 'initiated' || call.status === 'missed';
            
            return (
              <div key={call._id} className="call-item">
                <div className="call-avatar">
                  {otherPerson.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="call-info">
                  <span className="contact-name">{otherPerson.name}</span>
                  <div className="call-meta">
                    <span className="call-icon">
                      {call.callType === 'video' ? '📹' : '📞'}
                    </span>
                    <span className={`call-status ${isMissed ? 'missed' : ''}`}>
                      {isCaller ? 'Outgoing' : 'Incoming'} • {new Date(call.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="call-time">
                  {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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