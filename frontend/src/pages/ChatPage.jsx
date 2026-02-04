import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ChatPage.css';

const socket = io.connect("http://localhost:3000");

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  
  const receiverId = searchParams.get('receiverId');
  const receiverName = searchParams.get('receiverName');
  const user = JSON.parse(localStorage.getItem('user'));

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callId, setCallId] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    socket.emit("join_room", user._id);
    socket.emit("user_available", user._id);

    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/chat/history/${receiverId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => setChatHistory(data))
      .catch((err) => console.log("Error fetching chat history:", err));

    const handleReceiveMessage = (data) => {
        if (data.sender === receiverId || data.sender === user._id) {
            setChatHistory((prev) => [...prev, data]);
        }
    };

    socket.on("receive_message", handleReceiveMessage);
    
    // Handle incoming call with WebRTC
    socket.on("incoming_call_offer", (data) => {
      console.log("Incoming call:", data);
      setIncomingCall(data);
    });

    // Handle WebRTC offer
    socket.on("receive_offer", async (data) => {
      console.log("Received offer");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("send_answer", {
            to: receiverId,
            answer,
            callId: data.callId
          });
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      }
    });

    // Handle WebRTC answer
    socket.on("receive_answer", async (data) => {
      console.log("Received answer");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    // Handle ICE candidates
    socket.on("receive_ice_candidate", async (data) => {
      console.log("Received ICE candidate");
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    // Handle call rejection
    socket.on("call_rejected_webrtc", () => {
      console.log("Call rejected");
      setCallActive(false);
      setCallType(null);
      cleanupCall();
      alert("Call was rejected");
    });

    // Handle call ended
    socket.on("call_ended_webrtc", () => {
      console.log("Call ended");
      setCallActive(false);
      setCallType(null);
      cleanupCall();
    });

    // Handle call accepted
    socket.on("call_accepted_webrtc", (data) => {
      console.log("Call accepted");
      setCallActive(true);
    });

    return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("incoming_call_offer");
        socket.off("receive_offer");
        socket.off("receive_answer");
        socket.off("receive_ice_candidate");
        socket.off("call_rejected_webrtc");
        socket.off("call_ended_webrtc");
        socket.off("call_accepted_webrtc");
    };
  }, [receiverId, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const messageData = {
      sender: user._id,
      receiver: receiverId,
      message: message,
      createdAt: new Date()
    };

    await socket.emit("send_message", messageData);
    setChatHistory((prev) => [...prev, messageData]);
    setMessage("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const messageData = {
        sender: user._id,
        receiver: receiverId,
        message: `📎 ${file.name}`,
        createdAt: new Date()
      };
      socket.emit("send_message", messageData);
      setChatHistory((prev) => [...prev, messageData]);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const messageData = {
        sender: user._id,
        receiver: receiverId,
        message: `🖼️ ${file.name}`,
        createdAt: new Date()
      };
      socket.emit("send_message", messageData);
      setChatHistory((prev) => [...prev, messageData]);
    }
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const setupPeerConnection = async (isInitiator = false) => {
    try {
      const configuration = {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("send_ice_candidate", {
            to: receiverId,
            candidate: event.candidate,
            callId
          });
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          endCall();
        }
      };

      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("send_offer", {
          to: receiverId,
          offer,
          callId
        });
      }
    } catch (err) {
      console.error("Error setting up peer connection:", err);
      alert("Error setting up call: " + err.message);
      endCall();
    }
  };

  const startAudioCall = async () => {
    try {
      // Create call record first
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/calls/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          callType: 'audio'
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to initiate call");
        return;
      }

      const newCallId = data.call._id;
      setCallId(newCallId);
      setCallType('audio');

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      // Setup peer connection
      await setupPeerConnection(true);

      // Notify receiver
      socket.emit("initiate_call", {
        callerId: user._id,
        receiverId,
        callType: 'audio',
        callId: newCallId,
        callerName: user.name
      });

      setCallActive(true);
    } catch (err) {
      console.error("Error starting audio call:", err);
      alert("Cannot access microphone: " + err.message);
      setCallType(null);
    }
  };

  const startVideoCall = async () => {
    try {
      // Create call record first
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/calls/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          callType: 'video'
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to initiate call");
        return;
      }

      const newCallId = data.call._id;
      setCallId(newCallId);
      setCallType('video');

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      localStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup peer connection
      await setupPeerConnection(true);

      // Notify receiver
      socket.emit("initiate_call", {
        callerId: user._id,
        receiverId,
        callType: 'video',
        callId: newCallId,
        callerName: user.name
      });

      setCallActive(true);
    } catch (err) {
      console.error("Error starting video call:", err);
      alert("Cannot access camera/microphone: " + err.message);
      setCallType(null);
    }
  };

  const acceptCall = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get media stream
      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video' ? { width: 640, height: 480 } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (incomingCall.callType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCallType(incomingCall.callType);
      setCallId(incomingCall.callId);

      // Setup peer connection
      await setupPeerConnection(false);

      // Update call status
      await fetch(`http://localhost:3000/api/calls/${incomingCall.callId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      // Notify caller
      socket.emit("accept_call_webrtc", {
        callerId: incomingCall.callerId,
        receiverId: user._id,
        callId: incomingCall.callId
      });

      setIncomingCall(null);
      setCallActive(true);
    } catch (err) {
      console.error("Error accepting call:", err);
      alert("Cannot accept call: " + err.message);
    }
  };

  const rejectCall = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`http://localhost:3000/api/calls/${incomingCall.callId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      socket.emit("reject_call_webrtc", {
        callerId: incomingCall.callerId,
        callId: incomingCall.callId
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("Error rejecting call:", err);
    }
  };

  const endCall = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (callId) {
        await fetch(`http://localhost:3000/api/calls/${callId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'ended' })
        });
      }

      socket.emit("end_call_webrtc", {
        to: receiverId,
        callId
      });

      cleanupCall();
      setCallActive(false);
      setCallType(null);
      setCallId(null);
    } catch (err) {
      console.error("Error ending call:", err);
      cleanupCall();
      setCallActive(false);
      setCallType(null);
      setCallId(null);
    }
  };

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="user-info">
            <div className="avatar">{receiverName?.charAt(0).toUpperCase()}</div>
            <h3>{receiverName}</h3>
        </div>
        <div className="chat-actions">
          <button className="action-btn" onClick={startAudioCall} title="Start Audio Call">📞</button>
          <button className="action-btn" onClick={startVideoCall} title="Start Video Call">📹</button>
        </div>
      </div>

      <div className="chat-window">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === user._id ? "my-message" : "other-message"}`}>
            <div className="bubble">
              <p>{msg.message}</p>
              <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        <div className="input-actions">
          <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach File">📎</button>
          <input 
            ref={fileInputRef}
            type="file" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button className="attach-btn" onClick={() => photoInputRef.current.click()} title="Attach Photo">🖼️</button>
          <input 
            ref={photoInputRef}
            type="file" 
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
        </div>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="send-btn">
          ➤
        </button>
      </div>

      {callActive && callType && (
        <div className="call-container">
          <div className="call-window">
            <div className="video-grid">
              {/* Remote Video */}
              <div className="video-box remote">
                {callType === 'video' ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="video-stream"
                  />
                ) : (
                  <div className="audio-placeholder">
                    <div className="icon">🎤</div>
                    <p>{receiverName}</p>
                  </div>
                )}
              </div>

              {/* Local Video */}
              <div className="video-box local">
                {callType === 'video' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="video-stream"
                  />
                ) : (
                  <div className="audio-placeholder">
                    <div className="icon">🎤</div>
                    <p>You</p>
                  </div>
                )}
              </div>
            </div>

            <div className="call-controls">
              <button className="end-call-btn" onClick={endCall}>
                📞 End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="incoming-call-notification-chat">
          <div className="incoming-call-content-chat">
            <p className="incoming-call-text-chat">{incomingCall.callerName} is calling... ({incomingCall.callType === 'video' ? '📹' : '📞'})</p>
            <div className="incoming-call-actions-chat">
              <button className="accept-btn-inline-chat" onClick={acceptCall}>✓ Accept</button>
              <button className="reject-btn-inline-chat" onClick={rejectCall}>✗ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;