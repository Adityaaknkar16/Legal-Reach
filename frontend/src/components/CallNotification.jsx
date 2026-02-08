import React from 'react';
import './CallNotification.css';

const CallNotification = ({ callerName, onAnswer, onReject }) => {
  return (
    <div className="call-notification">
      <div className="call-content">
        <h3>Incoming Call</h3>
        <p>{callerName} is calling you...</p>
        <div className="call-actions">
          <button className="btn-answer" onClick={onAnswer}>Accept</button>
          <button className="btn-reject" onClick={onReject}>Reject</button>
        </div> 
      </div>
    </div> 
  );
};

export default CallNotification;