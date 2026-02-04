import React, { useRef, useState, useEffect } from 'react';

const AudioVideoCall = ({ isOpen, onClose, receiverId, receiverName, callType, callId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const initCall = async () => {
      try {
        // Get local stream
        const constraints = {
          audio: true,
          video: callType === 'video' ? { width: 640, height: 480 } : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        if (callType === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup WebRTC connection
        const configuration = {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
          ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setRemoteStream(event.streams[0]);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('send_ice_candidate', {
              to: receiverId,
              candidate: event.candidate,
              callId
            });
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState);
          if (peerConnection.connectionState === 'failed' || 
              peerConnection.connectionState === 'disconnected') {
            endCall();
          }
        };

      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Unable to access camera/microphone. Please check permissions.');
        onClose();
      }
    };

    initCall();

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, callType, receiverId, callId, userId, onClose]);

  const acceptCall = async () => {
    if (!peerConnectionRef.current) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('accept_call_webrtc', {
          callerId: userId,
          receiverId,
          callId
        });

        socketRef.current.emit('send_offer', {
          to: receiverId,
          offer,
          callId
        });
      }

      setCallActive(true);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const rejectCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('reject_call_webrtc', {
        callerId: userId,
        callId
      });
    }
    endCall();
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    setCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);

    if (socketRef.current) {
      socketRef.current.emit('end_call_webrtc', {
        to: receiverId,
        callId
      });
    }

    onClose();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">
            {callType === 'video' ? 'Video Call' : 'Audio Call'} with {receiverName}
          </h2>
          <button
            onClick={endCall}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Video Container */}
        <div className="grid grid-cols-2 gap-4 mb-6 h-96">
          {/* Remote Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            {callType === 'video' ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎤</div>
                  <p className="text-white">{receiverName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            {callType === 'video' && localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎤</div>
                  <p className="text-white">You</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!callActive ? (
            <>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                Accept Call
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                Reject Call
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`${
                  isMuted ? 'bg-red-500' : 'bg-blue-500'
                } hover:opacity-80 text-white px-6 py-3 rounded-full font-semibold transition`}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`${
                    !isVideoOn ? 'bg-red-500' : 'bg-blue-500'
                  } hover:opacity-80 text-white px-6 py-3 rounded-full font-semibold transition`}
                >
                  {!isVideoOn ? '📹 Turn On Video' : '📹 Turn Off Video'}
                </button>
              )}
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                End Call
              </button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="text-center mt-4 text-white">
          <p className="text-sm">
            {callActive ? 'Call in progress...' : 'Incoming call...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioVideoCall;
