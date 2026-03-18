import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LawyerRegister.css';

const LawyerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    barCouncilRegNumber: '',
    stateBarCouncil: '',
    yearOfEnrollment: '',
    specialization: '',
    officeAddress: '',
    aadhaarNumber: '',
    panNumber: '',
    city: '',
    experience: '',
    bio: ''
  });
  
  const [files, setFiles] = useState({
    sanad: null,
    cop: null,
    governmentId: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const stateBarCouncils = [
    'Bar Council of Maharashtra & Goa',
    'Bar Council of Delhi',
    'Bar Council of Karnataka',
    'Bar Council of Tamil Nadu',
    'Bar Council of Uttar Pradesh',
    'Bar Council of Gujarat',
    'Bar Council of Rajasthan',
    'Bar Council of West Bengal',
    'Bar Council of Kerala',
    'Bar Council of Madhya Pradesh',
    'Bar Council of Andhra Pradesh',
    'Bar Council of Punjab & Haryana',
    'Bar Council of Telangana',
    'Other'
  ];

  const specializations = [
    'Criminal Defense',
    'Family Law',
    'Corporate Law',
    'Civil Litigation',
    'Property Law',
    'Consumer Law',
    'Labor & Employment Law',
    'Tax Law',
    'Intellectual Property Law',
    'Constitutional Law',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(`${docType.toUpperCase()}: Only JPEG, PNG, and PDF files are allowed`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${docType.toUpperCase()}: File size must be less than 5MB`);
        return;
      }

      setFiles(prev => ({
        ...prev,
        [docType]: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.sanad) {
      setError("Sanad (Bar Council ID Card) is mandatory!");
      return;
    }
    
    if (!files.cop) {
      setError("Certificate of Practice (COP) is mandatory!");
      return;
    }
    
    if (!files.governmentId) {
      setError("Government ID (Aadhaar/Passport) is mandatory!");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files
      formDataToSend.append('sanad', files.sanad);
      formDataToSend.append('cop', files.cop);
      formDataToSend.append('governmentId', files.governmentId);
      
      await axios.post(
        'http://localhost:3000/api/new-lawyer/register', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert("Application submitted successfully! You will receive an email once your application is reviewed and approved.");
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || "Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lawyer-register-wrapper">
      <div className="lawyer-register-container">
        <div className="lawyer-register-header">
          <h1>Lawyer Registration</h1>
          <p>Join our platform to connect with clients</p>
        </div>

        <div className="lawyer-register-content">
          <div className="info-banner">
            <h3>Required Documents</h3>
            <ul>
              <li>Sanad (Bar Council ID Card)</li>
              <li>Certificate of Practice (COP)</li>
              <li>Government ID (Aadhaar/Passport)</li>
            </ul>
            <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
              Max file size: 5MB | Formats: JPG, PNG, PDF
            </p>
          </div>

          {error && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fee', 
              color: '#c00', 
              borderRadius: '5px', 
              marginBottom: '20px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lawyer-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="input-group">
                <label>Full Name *</label>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="As per Bar Council ID" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Email Address *</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Phone Number *</label>
                  <input 
                    name="phone" 
                    type="tel" 
                    placeholder="10-digit mobile" 
                    onChange={handleChange} 
                    required 
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password *</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Create strong password" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Professional Details</h2>
              
              <div className="input-group">
                <label>Bar Council Registration Number *</label>
                <input 
                  name="barCouncilRegNumber" 
                  type="text" 
                  placeholder="e.g., MAH/1234/2020" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>State Bar Council *</label>
                <select name="stateBarCouncil" onChange={handleChange} required>
                  <option value="">Select State Bar Council</option>
                  {stateBarCouncils.map(council => (
                    <option key={council} value={council}>{council}</option>
                  ))}
                </select>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Year of Enrollment *</label>
                  <input 
                    name="yearOfEnrollment" 
                    type="text" 
                    placeholder="e.g., 2015" 
                    onChange={handleChange} 
                    required 
                    maxLength="4"
                  />
                </div>

                <div className="input-group">
                  <label>Specialization *</label>
                  <select name="specialization" onChange={handleChange} required>
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Office Address *</label>
                <textarea 
                  name="officeAddress" 
                  placeholder="Complete office address for verification" 
                  onChange={handleChange} 
                  rows="3"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>City *</label>
                  <input 
                    name="city" 
                    type="text" 
                    placeholder="e.g., Pune" 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Years of Experience</label>
                  <input 
                    name="experience" 
                    type="text" 
                    placeholder="e.g., 5" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Identity Verification (KYC)</h2>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Aadhaar Number (Optional)</label>
                  <input 
                    name="aadhaarNumber" 
                    type="text" 
                    placeholder="12-digit number" 
                    onChange={handleChange} 
                    maxLength="12"
                  />
                </div>

                <div className="input-group">
                  <label>PAN Number (Optional)</label>
                  <input 
                    name="panNumber" 
                    type="text" 
                    placeholder="10-character PAN" 
                    onChange={handleChange} 
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Brief Bio</label>
                <textarea 
                  name="bio" 
                  placeholder="Tell us about your practice and expertise" 
                  onChange={handleChange} 
                  rows="4"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Upload Documents</h2>
              
              <div className="upload-group">
                <label className="required">1. Sanad (Bar Council ID) *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'sanad')}
                  required
                />
                {files.sanad && (
                  <span className="upload-success">
                    ✓ {files.sanad.name} ({(files.sanad.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>

              <div className="upload-group">
                <label className="required">2. Certificate of Practice (COP) *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'cop')}
                  required
                />
                {files.cop && (
                  <span className="upload-success">
                    ✓ {files.cop.name} ({(files.cop.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>

              <div className="upload-group">
                <label className="required">3. Government ID *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'governmentId')}
                  required
                />
                {files.governmentId && (
                  <span className="upload-success">
                    ✓ {files.governmentId.name} ({(files.governmentId.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Uploading Documents...' : 'Submit Application'}
            </button>

            <div className="form-links">
              <p>Already registered? <Link to="/login">Login here</Link></p>
              <p>Are you a client? <Link to="/signup">Register as Client</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LawyerRegister;