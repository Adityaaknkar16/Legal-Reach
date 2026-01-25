import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerifyOtp from './pages/VerifyOtp';
import Navbar from './components/navbar.jsx'; 
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import FindLawyers from './pages/FindLawyers.jsx';
import LawyerDetails from './pages/LawyerDetails.jsx';

import UserDashboard from './pages/UserDashboard.jsx';     
import LawyerDashboard from './pages/LawyerDashboard.jsx'; 

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-lawyers" element={<FindLawyers />} />
          <Route path="/lawyer/:id" element={<LawyerDetails />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;