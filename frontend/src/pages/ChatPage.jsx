import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ChatPage.css';

const socket = io.connect("http://localhost:3000");

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  
  const receiverId = searchParams.get('receiverId');
  const receiverName = searchParams.get('receiverName');
  const user = JSON.parse(localStorage.getItem('user'));

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    socket.emit("join_room", user._id);

    fetch(`http://localhost:3000/api/chat/${user._id}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => setChatHistory(data))
      .catch((err) => console.log(err));

    const handleReceiveMessage = (data) => {
        if (data.sender === receiverId || data.sender === user._id) {
            setChatHistory((prev) => [...prev, data]);
        }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
        socket.off("receive_message", handleReceiveMessage);
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

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="user-info">
            <div className="avatar">{receiverName?.charAt(0).toUpperCase()}</div>
            <h3>{receiverName}</h3>
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
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="send-btn">
          &#10148;
        </button>
      </div>
    </div>
  );
};

export default ChatPage;