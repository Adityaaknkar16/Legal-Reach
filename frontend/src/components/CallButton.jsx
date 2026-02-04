import React, { useState } from 'react';
import axios from 'axios';

const CallButton = ({ receiverId, receiverName, userId, onCallInitiated, callType = 'video' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateCall = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // Create call record in database
      const response = await axios.post(
        '/api/calls/initiate',
        {
          receiverId,
          callType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const callId = response.data.call._id;

        // Emit socket event to notify receiver
        if (window.socket) {
          window.socket.emit('initiate_call', {
            callerId: userId,
            receiverId,
            callType,
            callId,
            callerName: response.data.call.callerId.name
          });
        }

        // Trigger callback to open video/audio component
        if (onCallInitiated) {
          onCallInitiated({
            callId,
            callType,
            receiverId,
            receiverName
          });
        }
      }
    } catch (err) {
      console.error('Error initiating call:', err);
      setError('Failed to initiate call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          window.selectedCallType = 'video';
          initiateCall();
        }}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
      >
        {loading ? '...' : '📹 Video Call'}
      </button>
      <button
        onClick={() => {
          window.selectedCallType = 'audio';
          initiateCall();
        }}
        disabled={loading}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
      >
        {loading ? '...' : '🎤 Audio Call'}
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default CallButton;
