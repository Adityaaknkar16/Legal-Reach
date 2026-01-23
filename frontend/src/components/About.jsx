import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-container">
        <div className="about-content">
          <h2 className="about-title">About LegalReach</h2>
          <p className="about-description">
            LegalReach was founded with a simple mission: **To bridge the gap between people and justice.**
          </p>
          <p>
            Finding the right lawyer shouldn't be complicated. Whether you are facing a corporate dispute, a family matter, or need criminal defense, our platform connects you with verified, top-rated legal experts in your city.
          </p>
          
          <div className="about-stats">
            <div className="stat-item">
              <h3></h3>
              <span>Verified Lawyers</span>
            </div>
            <div className="stat-item">
              <h3></h3>
              <span>Happy Clients</span>
            </div>
            <div className="stat-item">
              <h3></h3>
              <span>Cities Covered</span>
            </div>
          </div>
        </div>

        <div className="about-image">
          <img 
            src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Law team meeting" 
          />
        </div>

      </div>
    </div>
  );
};

export default About;