import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ServicePage.css';

const ServicePage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const lawyerRes = await axios.get('http://localhost:3000/api/auth/lawyers');
        setLawyers(Array.isArray(lawyerRes.data) ? lawyerRes.data : []);

        if (token) {
            const chatRes = await axios.get('http://localhost:3000/api/connect/accepted', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveChats(Array.isArray(chatRes.data) ? chatRes.data : []);
        }

      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const sendRequest = async (lawyerId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login first");

        await axios.post('http://localhost:3000/api/connect/request', { receiverId: lawyerId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("Request Sent!");
    } catch (error) {
        alert("Request Failed");
    }
  };

  return (
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
                            onClick={() => navigate(`/chat?receiverId=${chatUser._id}&receiverName=${chatUser.name}`)}
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
            <h4>{lawyer.name}</h4>
            <p>{lawyer.specialization || "General Lawyer"}</p>
            <button className="connect-btn" onClick={() => sendRequest(lawyer._id)}>Connect +</button>
          </div>
        )) : <p>No lawyers found. Is the backend running?</p>}
      </div>
    </div>
  );
};

export default ServicePage;