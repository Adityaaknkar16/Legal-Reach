import React, { useEffect, useState } from 'react';
import AudioVideoCall from './AudioVideoCall';

const CallNotification = ({ socket, userId, userName }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming call offers
    const handleIncomingCall = (data) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
    };

    // Listen for call rejections
    const handleCallRejected = (data) => {
      console.log('Call rejected:', data);
      setIncomingCall(null);
      setCallActive(false);
      // Show notification
      alert('Call was rejected');
    };

    // Listen for call endings
    const handleCallEnded = (data) => {
      console.log('Call ended:', data);
      setCallActive(false);
      setIncomingCall(null);
    };

    socket.on('incoming_call_offer', handleIncomingCall);
    socket.on('call_rejected_webrtc', handleCallRejected);
    socket.on('call_ended_webrtc', handleCallEnded);

    // Notify server that user is available
    socket.emit('user_available', userId);

    return () => {
      socket.off('incoming_call_offer', handleIncomingCall);
      socket.off('call_rejected_webrtc', handleCallRejected);
      socket.off('call_ended_webrtc', handleCallEnded);
    };
  }, [socket, userId]);

  const handleCallClose = () => {
    setIncomingCall(null);
    setCallActive(false);
  };

  if (!incomingCall) return null;

  return (
    <>
      {/* Incoming Call Notification */}
      {!callActive && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 z-40 w-80">
          <h3 className="text-lg font-bold mb-2">Incoming {incomingCall.callType} Call</h3>
          <p className="text-gray-600 mb-4">{incomingCall.callerName} is calling...</p>
          <div className="flex gap-3">
            <button
              onClick={() => setCallActive(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Accept
            </button>
            <button
              onClick={handleCallClose}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Audio/Video Call Component */}
      <AudioVideoCall
        isOpen={callActive}
        onClose={handleCallClose}
        receiverId={incomingCall.callerId}
        receiverName={incomingCall.callerName}
        callType={incomingCall.callType}
        callId={incomingCall.callId}
        userId={userId}
      />
    </>
  );
};

export default CallNotification;
