import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Scale, Building2, Home, ShieldAlert, Briefcase } from 'lucide-react';
import './PracticeAreas.css';

// Enhanced Data with Lucide Icons
const services = [
  { 
    title: "Family Law", 
    Icon: Users,
    iconColor: "#2563eb",
    iconBg: "#eff6ff",
    desc: "Divorce, Child Custody, and Adoption",
    details: "Our family law experts handle sensitive matters with care. We provide legal assistance for divorce proceedings, child custody agreements, alimony, adoption processes, and domestic violence protection."
  },
  { 
    title: "Criminal Defense", 
    Icon: Scale, 
    iconColor: "#dc2626",
    iconBg: "#fef2f2",
    desc: "Theft, DUI, and other criminal charges",
    details: "Facing criminal charges can be daunting. Our defense lawyers specialize in bail matters, theft, DUI/DWI, assault, and white-collar crimes, ensuring your rights are protected throughout the legal process."
  },
  { 
    title: "Corporate Law", 
    Icon: Building2, 
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    desc: "Business disputes, Mergers, and Contracts",
    details: "We assist businesses with company registration, contract drafting, mergers and acquisitions, compliance issues, and resolving shareholder disputes to ensure smooth operations."
  },
  { 
    title: "Property Dispute", 
    Icon: Home, 
    iconColor: "#059669",
    iconBg: "#ecfdf5",
    desc: "Land issues, Tenant rights, and Ownership",
    details: "Resolve real estate conflicts effectively. We handle property ownership disputes, landlord-tenant issues, illegal possession, and property transfer documentation."
  },
  { 
    title: "Cyber Crime", 
    Icon: ShieldAlert, 
    iconColor: "#d97706",
    iconBg: "#fffbeb",
    desc: "Online fraud, Hacking, and Data Theft",
    details: "In the digital age, we protect you against online fraud, identity theft, hacking, cyberstalking, and data breaches with specialized legal and technical expertise."
  },
  { 
    title: "Labor & Employment", 
    Icon: Briefcase, 
    iconColor: "#0891b2",
    iconBg: "#ecfeff",
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
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: service.iconBg,
              color: service.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <service.Icon size={28} />
            </div>
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
            
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: selectedService.iconBg,
                color: selectedService.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <selectedService.Icon size={24} />
              </div>
              <h3 style={{ margin: 0 }}>{selectedService.title}</h3>
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