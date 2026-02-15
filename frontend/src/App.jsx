import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicePage from './pages/ServicePage';
import LawyerDashboard from './pages/LawyerDashboard';
import ChatPage from './pages/ChatPage';
import About from './components/About';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp'; 

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* ✅ FIXED: Changed verifyOtp to verify-otp to match Register.jsx */}
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>
    </Router>
  );
};

export default App;