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
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
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
  }, [navigate, user]);

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
  }, [selectedChat, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    socket.on("incoming_call", (data) => {
      setIncomingCall(data);
    });

    return () => {
      socket.off("incoming_call");
    };
  }, []);

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
    
    setCallType('audio');
    setCallActive(true);
    
    // Add notification to chat
    const callNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `📞 Started an audio call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, callNotification]);
    
    socket.emit("call_user", {
      to: selectedChat._id,
      from: user._id,
      type: 'audio',
      fromName: user.name
    });
  };

  const startVideoCall = () => {
    if (!selectedChat) return;

    setCallType('video');
    setCallActive(true);

    // Add notification to chat
    const callNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `📹 Started a video call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, callNotification]);

    // Request camera and microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        socket.emit("call_user", {
          to: selectedChat._id,
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
    const acceptNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `✓ Accepted the ${incomingCall?.type} call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, acceptNotification]);

    if (incomingCall?.type === 'video') {
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
    setCallType(incomingCall?.type);
  };

  const rejectCall = () => {
    const rejectNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `✗ Rejected the ${incomingCall?.type} call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, rejectNotification]);

    socket.emit("reject_call", {
      to: incomingCall.from
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    const endNotification = {
      sender: user._id,
      receiver: selectedChat._id,
      message: `📵 Ended the call`,
      createdAt: new Date(),
      isSystemMessage: true
    };
    setChatMessages((prev) => [...prev, endNotification]);

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    socket.emit("end_call", {
      to: selectedChat._id
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

  const sendRequest = async (lawyerId) => {
    try {
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) return alert("Please login first");

        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Sending request with config:', config);
        
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
            {callActive && callType && (
              <div className="call-status-banner">
                <span>{callType === 'video' ? '📹' : '📞'} {callType === 'video' ? 'Video' : 'Audio'} Call in Progress</span>
                <button className="end-call-btn-banner" onClick={endCall}>End Call</button>
              </div>
            )}

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
              <button className="accept-btn-inline" onClick={acceptCall}>✓ Accept</button>
              <button className="reject-btn-inline" onClick={rejectCall}>✗ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;