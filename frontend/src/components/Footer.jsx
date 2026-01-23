import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h3>Legal<span className="footer-highlight">Reach</span></h3>
          <p>
            Making legal assistance accessible, transparent, and efficient for everyone.
            Connect with expert lawyers today.
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#lawyers">Find Lawyers</a></li>
            <li><a href="#services">Practice Areas</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul>
            <li>address</li>
            <li>999999999</li>
            <li>✉️ support@legalreach.com</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Legal Reach. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;