import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; 
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FindLawyers from './pages/FindLawyers';
import LawyerDetails from './pages/LawyerDetails';

import UserDashboard from './pages/UserDashboard';     
import LawyerDashboard from './pages/LawyerDashboard'; 

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
          
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;