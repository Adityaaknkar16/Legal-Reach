import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // We will create this file next

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          Legal<span className="logo-highlight">Reach</span>
        </div>

        <ul className="nav-links">
          <li><Link to = "/">Home</Link></li>
          <li><Link to="/find-lawyers" className="hover:text-blue-400">Find Lawyers</Link></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About Us</a></li>
        </ul>

        <div className="nav-buttons">
          <Link to="/login">
            <button className="btn-login">Login</button>
          </Link>
          
          <Link to="/signup">
            <button className="btn-signup">Sign Up</button>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;