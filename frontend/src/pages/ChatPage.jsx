import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  Phone, 
  Video, 
  FolderOpen, 
  Paperclip, 
  Image as ImageIcon, 
  Send, 
  FileText, 
  ExternalLink, 
  Clock, 
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react';
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

  const [uploading, setUploading] = useState(false);

  const uploadAndSend = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post('http://localhost:3000/api/chat/upload', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { fileUrl, fileName, fileType } = res.data;
      const isImg = fileType?.startsWith('image/');

      const messageData = {
        sender: user._id,
        receiver: receiverId,
        message: isImg ? 'Shared an image' : `Shared document: ${fileName}`,
        fileUrl,
        fileName,
        fileType,
        createdAt: new Date()
      };

      socketRef.current.emit("send_message", messageData);
      setChatHistory((prev) => [...prev, messageData]);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAndSend(file);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAndSend(file);
      e.target.value = '';
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
      navigate(`/voice-call?roomId=${roomId}&receiverId=${receiverId}&userName=${user.name}&callType=audio`);
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
      navigate(`/voice-call?roomId=${roomId}&receiverId=${receiverId}&userName=${user.name}&callType=video`);
    }, 1000);
  };

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)} title="Back" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="user-info">
            <div className="avatar">{receiverName?.charAt(0).toUpperCase()}</div>
            <h3>{receiverName}</h3>
            {isConnected && (
              <span style={{ 
                width: '9px', 
                height: '9px', 
                backgroundColor: '#16a34a', 
                borderRadius: '50%', 
                display: 'inline-block',
                boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.3)'
              }} title="Online"></span>
            )}
        </div>
        <div className="chat-actions">
          <button 
            className="action-btn" 
            onClick={() => navigate(user.role === 'lawyer' ? '/lawyer-dashboard' : '/user-dashboard')} 
            title="Open Case Documents Vault"
            style={{ fontSize: '13px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FolderOpen size={15} /> Vault
          </button>
          <button className="action-btn" onClick={startAudioCall} title="Start Audio Call" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={16} />
          </button>
          <button className="action-btn" onClick={startVideoCall} title="Start Video Call" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={16} />
          </button>
        </div>
      </div>

      <div className="chat-window">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === user._id ? "my-message" : "other-message"}`}>
            <div className="bubble">
              {msg.fileUrl && (
                <div style={{ marginBottom: '8px' }}>
                  {msg.fileType?.startsWith('image/') ? (
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={msg.fileUrl} 
                        alt={msg.fileName || "Image attachment"} 
                        style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '8px', display: 'block', objectFit: 'cover' }} 
                      />
                    </a>
                  ) : (
                    <a 
                      href={msg.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: msg.sender === user._id ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                        color: msg.sender === user._id ? '#fff' : '#2563eb',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      <FileText size={15} /> {msg.fileName || 'View Document'} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
              <p>{msg.message}</p>
              <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {uploading && (
          <div className="message-row my-message">
            <div className="bubble" style={{ opacity: 0.85, fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Uploading attachment to secure cloud...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        <div className="input-actions">
          <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach File" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paperclip size={18} />
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button className="attach-btn" onClick={() => photoInputRef.current.click()} title="Attach Photo" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={18} />
          </button>
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
        <button onClick={sendMessage} className="send-btn" disabled={!isConnected} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;