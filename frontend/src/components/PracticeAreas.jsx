import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PracticeAreas.css';

// Enhanced Data with "Details"
const services = [
  { 
    title: "Family Law", 
    icon: "👨‍👩‍👧‍👦", 
    desc: "Divorce, Child Custody, and Adoption",
    details: "Our family law experts handle sensitive matters with care. We provide legal assistance for divorce proceedings, child custody agreements, alimony, adoption processes, and domestic violence protection."
  },
  { 
    title: "Criminal Defense", 
    icon: "⚖️", 
    desc: "Theft, DUI, and other criminal charges",
    details: "Facing criminal charges can be daunting. Our defense lawyers specialize in bail matters, theft, DUI/DWI, assault, and white-collar crimes, ensuring your rights are protected throughout the legal process."
  },
  { 
    title: "Corporate Law", 
    icon: "🏢", 
    desc: "Business disputes, Mergers, and Contracts",
    details: "We assist businesses with company registration, contract drafting, mergers and acquisitions, compliance issues, and resolving shareholder disputes to ensure smooth operations."
  },
  { 
    title: "Property Dispute", 
    icon: "🏠", 
    desc: "Land issues, Tenant rights, and Ownership",
    details: "Resolve real estate conflicts effectively. We handle property ownership disputes, landlord-tenant issues, illegal possession, and property transfer documentation."
  },
  { 
    title: "Cyber Crime", 
    icon: "💻", 
    desc: "Online fraud, Hacking, and Data Theft",
    details: "In the digital age, we protect you against online fraud, identity theft, hacking, cyberstalking, and data breaches with specialized legal and technical expertise."
  },
  { 
    title: "Labor & Employment", 
    icon: "👷", 
    desc: "Workplace harassment and Unpaid wages",
    details: "We fight for workers' rights, including cases of wrongful termination, workplace harassment, unpaid wages, provident fund disputes, and employment contract violations."
  },
];

const PracticeAreas = () => {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const handleFindLawyers = () => {
    navigate('/find-lawyers', { state: { query: selectedService.title } });
  };

  return (
    <div className="practice-section" id="services">
      <h2 className="section-title">Our Legal Practice Areas</h2>
      <p className="section-subtitle">Click on a category to learn more.</p>
      
      <div className="services-grid">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="service-card" 
            onClick={() => setSelectedService(service)} // Open Modal on Click
          >
            <div className="icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>


      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="modal-close" onClick={() => setSelectedService(null)}>
              &times;
            </button>
            
            <div className="modal-header">
              <span className="modal-icon">{selectedService.icon}</span>
              <h3>{selectedService.title}</h3>
            </div>
            
            <p className="modal-description">{selectedService.details}</p>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedService(null)}>
                Close
              </button>
              <button className="btn-primary" onClick={handleFindLawyers}>
                Find {selectedService.title} Lawyers
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PracticeAreas;