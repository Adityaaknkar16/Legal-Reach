import React from 'react';
import './FeaturedLawyers.css';

const lawyers = [
  {
    id: 1,
    name: "Adv. Amit Sharma",
    specialty: "Criminal Lawyer",
    experience: "12 Years Experience",
    image: "", 
  },
  {
    id: 2,
    name: "Adv. Priya Desai",
    specialty: "Family & Divorce",
    experience: "8 Years Experience",
    image: "",
  },
  {
    id: 3,
    name: "Adv. Rajesh Verma",
    specialty: "Corporate Law",
    experience: "15 Years Experience",
    image: "",
  },
];

const FeaturedLawyers = () => {
  return (
    <div className="lawyer-section" id="lawyers">
      <h2 className="lawyer-title">Top Rated Lawyers Near You</h2>
      
      <div className="lawyer-grid">
        {lawyers.map((lawyer) => (
          <div key={lawyer.id} className="lawyer-card">
            <img src={lawyer.image} alt={lawyer.name} className="lawyer-img" />
            <h3>{lawyer.name}</h3>
            <span className="specialty">{lawyer.specialty}</span>
            <p className="experience">{lawyer.experience}</p>
           
            <button className="contact-btn">Contact Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedLawyers;