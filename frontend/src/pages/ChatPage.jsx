import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { generateRoomKey, encryptMessage, decryptMessage } from '../utils/cryptoUtils';
import './ChatPage.css';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const socketRef = useRef(null);
  
  const receiverId = searchParams.get('receiverId');
  const receiverName = searchParams.get('receiverName');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [roomKey, setRoomKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
        navigate('/login');
        return;
    }

    const key = generateRoomKey(user._id, receiverId);
    setRoomKey(key);

    socketRef.current = io.connect("http://localhost:3000", {
      auth: {
        token: token
      }
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("join_room", user._id);
      socketRef.current.emit("user_available", user._id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      alert("Failed to connect to chat server. Please login again.");
      navigate('/login');
    });

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

    socketRef.current.on("receive_message", handleReceiveMessage);

    socketRef.current.on("incoming_call_notification", (data) => {
      const accept = window.confirm(`${data.callerName} is calling you (${data.callType}). Accept?`);
      if (accept) {
        navigate(`/voice-call?roomId=${data.roomId}&userName=${user.name}&callType=${data.callType}`);
      }
    });

    socketRef.current.on("error", (error) => {
      alert(error.message);
    });

    return () => {
        if (socketRef.current) {
          socketRef.current.off("receive_message", handleReceiveMessage);
          socketRef.current.off("incoming_call_notification");
          socketRef.current.off("error");
          socketRef.current.disconnect();
        }
    };
  }, [receiverId, user, navigate, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (message.trim() === "" || !isConnected) return;

    const messageData = {
      sender: user._id,
      receiver: receiverId,
      message: message,
      createdAt: new Date()
    };

    socketRef.current.emit("send_message", messageData);
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
      socketRef.current.emit("send_message", messageData);
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
      socketRef.current.emit("send_message", messageData);
      setChatHistory((prev) => [...prev, messageData]);
    }
  };

  const startAudioCall = () => {
    const roomId = `audio_${user._id}_${receiverId}_${Date.now()}`;
    
    socketRef.current.emit("notify_call", {
      callerId: user._id,
      receiverId: receiverId,
      callerName: user.name,
      roomId: roomId,
      callType: 'audio'
    });

    setTimeout(() => {
      navigate(`/voice-call?roomId=${roomId}&userName=${user.name}&callType=audio`);
    }, 1000);
  };

  const startVideoCall = () => {
    const roomId = `video_${user._id}_${receiverId}_${Date.now()}`;
    
    socketRef.current.emit("notify_call", {
      callerId: user._id,
      receiverId: receiverId,
      callerName: user.name,
      roomId: roomId,
      callType: 'video'
    });

    setTimeout(() => {
      navigate(`/voice-call?roomId=${roomId}&userName=${user.name}&callType=video`);
    }, 1000);
  };

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="user-info">
            <div className="avatar">{receiverName?.charAt(0).toUpperCase()}</div>
            <h3>{receiverName}</h3>
            {isConnected && <span className="status-indicator">🟢</span>}
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
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={!isConnected}
        />
        <button onClick={sendMessage} className="send-btn" disabled={!isConnected}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatPage;