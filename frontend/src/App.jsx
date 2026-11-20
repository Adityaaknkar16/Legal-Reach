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
import VoiceCall from './pages/VoiceCall';
import LawyerRegister from './pages/LawyerRegister';
import AdminPanel from './pages/AdminPanel';
import FindLawyers from './pages/FindLawyers';
import LawyerDetails from './pages/LawyerDetails';
import UserDashboard from './pages/UserDashboard';
import ForgotPassword from './pages/ForgotPassword';
import EditProfile from './pages/EditProfile';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/voice-Call" element={<VoiceCall />} />
        <Route path="/voice-call" element={<VoiceCall />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/lawyer-register" element={<LawyerRegister />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/find-lawyers" element={<FindLawyers />} />
        <Route path="/lawyer/:id" element={<LawyerDetails />} />
      </Routes>
    </Router>
  );
};

export default App;