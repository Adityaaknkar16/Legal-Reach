import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ServicePage.css';

const socket = io.connect("http://localhost:3000");

const ServicePage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));
  
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const lawyerRes = await axios.get('http://localhost:3000/api/auth/lawyers');
        setLawyers(Array.isArray(lawyerRes.data) ? lawyerRes.data : []);

        const chatRes = await axios.get('http://localhost:3000/api/connect/my-connections', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setActiveChats(Array.isArray(chatRes.data) ? chatRes.data : []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("join_room", user._id);
      
      const token = localStorage.getItem('token');
      fetch(`http://localhost:3000/api/chat/history/${selectedChat._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((data) => setChatMessages(data))
        .catch((err) => console.log("Error fetching chat history:", err));
    }
  }, [selectedChat, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    socket.on("incoming_call", (data) => {
      setIncomingCall(data);
    });

    socket.on("incoming_call_notification", (data) => {
      const accept = window.confirm(`${data.callerName} is calling you (${data.callType}). Accept?`);
      if (accept) {
        navigate(`/voice-call?roomId=${data.roomId}&userName=${user.name}&callType=${data.callType}`);
      }
    });

    return () => {
      socket.off("incoming_call");
      socket.off("incoming_call_notification");
    };
  }, [user, navigate]);

  const sendMessage = async () => {
    if (chatMessage.trim() === "" || !selectedChat) return;

    const messageData = {
      sender: user._id,
      receiver: selectedChat._id,
      message: chatMessage,
      createdAt: new Date()
    };

    socket.emit("send_message", messageData);
    setChatMessages((prev) => [...prev, messageData]);
    setChatMessage("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const messageData = {
        sender: user._id,
        receiver: selectedChat._id,
        message: `📎 ${file.name}`,
        createdAt: new Date()
      };
      socket.emit("send_message", messageData);
      setChatMessages((prev) => [...prev, messageData]);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const messageData = {
        sender: user._id,
        receiver: selectedChat._id,
        message: `🖼️ ${file.name}`,
        createdAt: new Date()
      };
      socket.emit("send_message", messageData);
      setChatMessages((prev) => [...prev, messageData]);
    }
  };

  const startAudioCall = () => {
    if (!selectedChat) return;
    
    const roomId = `audio_${user._id}_${selectedChat._id}_${Date.now()}`;
    
    const callNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `📞 Started an audio call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, callNotification]);
    
    socket.emit("notify_call", {
      callerId: user._id,
      receiverId: selectedChat._id,
      callerName: user.name,
      roomId: roomId,
      callType: 'audio'
    });

    setTimeout(() => {
      navigate(`/voice-call?roomId=${roomId}&userName=${user.name}&callType=audio`);
    }, 1000);
  };

  const startVideoCall = () => {
    if (!selectedChat) return;

    const roomId = `video_${user._id}_${selectedChat._id}_${Date.now()}`;

    const callNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `📹 Started a video call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, callNotification]);

    socket.emit("notify_call", {
      callerId: user._id,
      receiverId: selectedChat._id,
      callerName: user.name,
      roomId: roomId,
      callType: 'video'
    });

    setTimeout(() => {
      navigate(`/voice-call?roomId=${roomId}&userName=${user.name}&callType=video`);
    }, 1000);
  };

  const sendRequest = async (lawyerId) => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) return alert("Please login first");

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.post('http://localhost:3000/api/connect/send', { lawyerId }, config);
        alert("Request Sent!");
    } catch (error) {
        console.error("Request error full response:", error.response);
        alert("Request Failed: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="service-wrapper"><div className="service-container"><p>Loading...</p></div></div>;
  }

  return (
    <div className="service-wrapper">
      <div className="service-container">
        <h2>Find a Lawyer</h2>

        {activeChats.length > 0 && (
          <div className="section">
              <h3>Active Chats</h3>
              <div className="card-list">
                  {activeChats.map((chatUser) => (
                      <div key={chatUser._id} className="card active-chat">
                          <h4>{chatUser.name}</h4>
                          <button 
                              className="chat-btn"
                              onClick={() => setSelectedChat(chatUser)}
                          >
                              Open Chat
                          </button>
                      </div>
                  ))}
              </div>
          </div>
        )}

        <h3>Available Lawyers</h3>
        <div className="card-list">
          {lawyers.length > 0 ? lawyers.map((lawyer) => (
            <div key={lawyer._id} className="card">
              <div className="lawyer-image">
                {lawyer.profileImage ? (
                  <img src={lawyer.profileImage} alt={lawyer.name} />
                ) : (
                  <div className="avatar-placeholder">{lawyer.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <h4>{lawyer.name}</h4>
              <p>{lawyer.specialization || "General Lawyer"}</p>
              <button className="connect-btn" onClick={() => sendRequest(lawyer._id)}>Connect +</button>
            </div>
          )) : <p>No lawyers found. Is the backend running?</p>}
        </div>
      </div>

      {selectedChat && (
        <div className="chat-sidebar">
          <div className="chat-header-sidebar">
            <h3>{selectedChat.name}</h3>
            <div className="chat-actions-sidebar">
              <button className="action-btn-sidebar" onClick={startAudioCall} title="Audio Call">📞</button>
              <button className="action-btn-sidebar" onClick={startVideoCall} title="Video Call">📹</button>
            </div>
            <button className="close-btn" onClick={() => setSelectedChat(null)}>×</button>
          </div>

          <div className="chat-messages-sidebar">
            {chatMessages.map((msg, index) => (
              msg.isSystemMessage ? (
                <div key={index} className="system-message">
                  <p>{msg.message}</p>
                </div>
              ) : (
                <div key={index} className={`message-row ${msg.sender === user._id ? "my-message" : "other-message"}`}>
                  <div className="bubble">
                    <p>{msg.message}</p>
                    <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-sidebar">
            <div className="input-actions-sidebar">
              <button className="attach-btn-sidebar" onClick={() => fileInputRef.current.click()} title="Attach File">📎</button>
              <input 
                ref={fileInputRef}
                type="file" 
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button className="attach-btn-sidebar" onClick={() => photoInputRef.current.click()} title="Attach Photo">🖼️</button>
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
              value={chatMessage} 
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="send-btn-sidebar">
              ➤
            </button>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="incoming-call-notification">
          <div className="incoming-call-content">
            <p className="incoming-call-text">{incomingCall.fromName} is calling... ({incomingCall.type === 'video' ? '📹' : '📞'})</p>
            <div className="incoming-call-actions">
              <button className="accept-btn-inline" onClick={() => {
                navigate(`/voice-call?roomId=${incomingCall.roomId}&userName=${user.name}&callType=${incomingCall.type}`);
                setIncomingCall(null);
              }}>✓ Accept</button>
              <button className="reject-btn-inline" onClick={() => setIncomingCall(null)}>✗ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;