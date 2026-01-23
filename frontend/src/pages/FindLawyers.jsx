import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './FindLawyers.css';

const allLawyers = [
  { id: 1, name: "Adv. Amit Sharma", location: "Pune", category: "Criminal", experience: "12 years", fees: "₹2000/hr" },
  { id: 2, name: "Adv. Priya Desai", location: "Mumbai", category: "Family", experience: "8 years", fees: "₹1500/hr" },
  { id: 3, name: "Adv. Rajesh Verma", location: "Delhi", category: "Corporate", experience: "15 years", fees: "₹3000/hr" },
  { id: 4, name: "Adv. Sneha Patil", location: "Pune", category: "Property", experience: "5 years", fees: "₹1000/hr" },
  { id: 5, name: "Adv. Rahul Nair", location: "Bangalore", category: "Criminal", experience: "10 years", fees: "₹2500/hr" },
];

const FindLawyers = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.query || "");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredLawyers = allLawyers.filter(lawyer => {
    return (
      (selectedCategory === "All" || lawyer.category === selectedCategory) &&
      (lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       lawyer.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
       lawyer.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="find-lawyers-container">
      <div className="filters-sidebar">
        <h3>Filters</h3>
        
        <div className="filter-group">
          <label>Search Name/City</label>
          <input 
            type="text" 
            placeholder="e.g. Pune" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <select onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
            <option value="Corporate">Corporate</option>
            <option value="Property">Property</option>
          </select>
        </div>
      </div>

      <div className="results-area">
        <h2>{filteredLawyers.length} Lawyers Found</h2>
        
        <div className="results-grid">
          {filteredLawyers.map(lawyer => (
            <div key={lawyer.id} className="result-card">
              <div className="card-header">
                <h3>{lawyer.name}</h3>
                <span className="badge">{lawyer.category}</span>
              </div>
              <p> {lawyer.location}</p>
              <p> {lawyer.experience} Experience</p>
              <p> {lawyer.fees}</p>
              
              <Link to={`/lawyer/${lawyer.id}`}>
                <button className="view-profile-btn">View Profile</button>
              </Link>
            </div>
          ))}
          
          {filteredLawyers.length === 0 && <p>No lawyers found matching your criteria.</p>}
        </div>
      </div>
    </div>
  );
};

export default FindLawyers;