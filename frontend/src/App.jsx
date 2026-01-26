import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicePage from './pages/ServicePage';
import LawyerDashboard from './pages/LawyerDashboard';
import ChatPage from './pages/ChatPage';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Client Page */}
        <Route path="/service" element={<ServicePage />} />
        
        {/* Lawyer Page - MAKE SURE THIS MATCHES THE LOGIN REDIRECT */}
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        
        {/* Chat Page */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;