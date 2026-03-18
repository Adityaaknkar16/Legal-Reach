import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FindLawyers.css';

const FindLawyers = () => {
  const location = useLocation();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState(location.state?.searchName || location.state?.query || '');
  const [searchCity, setSearchCity] = useState(location.state?.searchCity || '');
  const [selectedSpecialization, setSelectedSpecialization] = useState(location.state?.filterSpecialization || '');

  const specializations = [
    'All Specializations',
    'Criminal Defense',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Civil Litigation',
    'Consumer Law',
    'Labor & Employment Law',
    'Tax Law',
    'Intellectual Property Law',
    'Constitutional Law'
  ];

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/auth/lawyers');
      setLawyers(response.data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesName = !searchName || lawyer.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesCity = !searchCity || lawyer.city?.toLowerCase().includes(searchCity.toLowerCase());
    const matchesSpec = !selectedSpecialization || 
                        selectedSpecialization === 'All Specializations' || 
                        lawyer.specialization === selectedSpecialization;
    return matchesName && matchesCity && matchesSpec;
  });

  return (
    <div className="find-lawyers-container">
      <div className="filters-sidebar">
        <h3>Filter Lawyers</h3>
        
        <div className="filter-group">
          <label>Lawyer Name</label>
          <input 
            type="text" 
            placeholder="Enter name" 
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <label>City</label>
          <input 
            type="text" 
            placeholder="e.g. Pune" 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Specialization</label>
          <select 
            value={selectedSpecialization || 'All Specializations'}
            onChange={(e) => setSelectedSpecialization(e.target.value === 'All Specializations' ? '' : e.target.value)}
            className="filter-select"
          >
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => {
            setSearchName('');
            setSearchCity('');
            setSelectedSpecialization('');
          }}
          className="clear-filters-btn"
        >
          Clear Filters
        </button>
      </div>

      <div className="results-area">
        <div className="results-header">
          <h2>{filteredLawyers.length} Lawyers Found</h2>
          {selectedSpecialization && selectedSpecialization !== 'All Specializations' && (
            <span className="filter-badge">{selectedSpecialization}</span>
          )}
        </div>
        
        {loading ? (
          <div className="loading">Loading lawyers...</div>
        ) : (
          <div className="results-grid">
            {filteredLawyers.map(lawyer => (
              <div key={lawyer._id} className="result-card">
                <div className="card-header">
                  <h3>{lawyer.name}</h3>
                  <span className="badge">{lawyer.specialization}</span>
                </div>
                
                <div className="card-details">
                  <div className="detail-item">
                    <strong>Location:</strong> {lawyer.city}
                  </div>
                  <div className="detail-item">
                    <strong>Experience:</strong> {lawyer.experience || 'Not specified'}
                  </div>
                  {lawyer.barCouncilRegNumber && (
                    <div className="detail-item">
                      <strong>Bar Council:</strong> {lawyer.barCouncilRegNumber}
                    </div>
                  )}
                  {lawyer.phone && (
                    <div className="detail-item">
                      <strong>Contact:</strong> {lawyer.phone}
                    </div>
                  )}
                </div>

                {lawyer.bio && (
                  <p className="lawyer-bio">{lawyer.bio.substring(0, 120)}...</p>
                )}
                
                <Link to={`/lawyer/${lawyer._id}`}>
                  <button className="view-profile-btn">View Full Profile</button>
                </Link>
              </div>
            ))}
            
            {filteredLawyers.length === 0 && (
              <div className="no-results">
                <h3>No lawyers found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindLawyers;