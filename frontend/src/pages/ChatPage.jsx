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
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    socket.emit("join_room", user._id);

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
    socket.on("incoming_call", (data) => {
      setIncomingCall(data);
    });

    return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("incoming_call");
        socket.off("call_accepted");
        socket.off("call_rejected");
        socket.off("call_ended");
        socket.off("call_offer");
        socket.off("call_answer");
        socket.off("ice_candidate");
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

  const startAudioCall = () => {
    setCallType('audio');
    setCallActive(true);
    socket.emit("call_user", {
      to: receiverId,
      from: user._id,
      type: 'audio',
      fromName: user.name
    });
  };

  const startVideoCall = () => {
    setCallType('video');
    setCallActive(true);

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        socket.emit("call_user", {
          to: receiverId,
          from: user._id,
          type: 'video',
          fromName: user.name
        });
      })
      .catch(err => {
        console.error("Error accessing media devices:", err);
        alert("Please allow camera and microphone access");
        setCallActive(false);
        setCallType(null);
      });
  };

  const acceptCall = () => {
    if (callType === 'video') {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        });
    }
    
    socket.emit("accept_call", {
      to: incomingCall.from
    });
    setIncomingCall(null);
    setCallActive(true);
  };

  const rejectCall = () => {
    socket.emit("reject_call", {
      to: incomingCall.from
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    socket.emit("end_call", {
      to: receiverId
    });
    setCallActive(false);
    setCallType(null);
  };

  // Peer connection event handlers
  useEffect(() => {
    socket.on("call_rejected", () => {
      setCallActive(false);
      setCallType(null);
      alert("Call rejected");
    });

    socket.on("call_ended", () => {
      setCallActive(false);
      setCallType(null);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    });

    return () => {
      socket.off("call_rejected");
      socket.off("call_ended");
    };
  }, []);

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
        <div className="call-status-banner-chat">
          <span>{callType === 'video' ? '📹' : '📞'} {callType === 'video' ? 'Video' : 'Audio'} Call in Progress</span>
          <button className="end-call-btn-banner-chat" onClick={endCall}>End Call</button>
        </div>
      )}

      {incomingCall && (
        <div className="incoming-call-notification-chat">
          <div className="incoming-call-content-chat">
            <p className="incoming-call-text-chat">{incomingCall.fromName} is calling... ({incomingCall.type === 'video' ? '📹' : '📞'})</p>
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