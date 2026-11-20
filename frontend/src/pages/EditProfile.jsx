import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, CheckCircle2, User, Phone, MapPin, Briefcase, FileText, Building2 } from 'lucide-react';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    experience: '',
    specialization: '',
    officeAddress: '',
    barCouncilRegNumber: '',
    role: 'client',
    profilePic: ''
  });

  const [previewImage, setPreviewImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        bio: data.bio || '',
        experience: data.experience || '',
        specialization: data.specialization || '',
        officeAddress: data.officeAddress || '',
        barCouncilRegNumber: data.barCouncilRegNumber || '',
        role: data.role || 'client',
        profilePic: data.profilePic || ''
      });

      if (data.profilePic) {
        setPreviewImage(data.profilePic);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to load profile. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5 MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const data = new FormData();

      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('city', formData.city);
      data.append('bio', formData.bio);
      data.append('experience', formData.experience);
      data.append('specialization', formData.specialization);
      data.append('officeAddress', formData.officeAddress);

      if (selectedFile) {
        data.append('profilePic', selectedFile);
      }

      const res = await axios.put('http://localhost:3000/api/auth/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Profile updated successfully!');
      
      // Update local storage user cache so headers and dashboards update immediately
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const updatedUser = {
        ...currentUser,
        name: res.data.user.name,
        profilePic: res.data.user.profilePic,
        role: res.data.user.role
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        setSuccess('');
      }, 4000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (formData.role === 'lawyer') {
      navigate('/lawyer-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  if (loading) {
    return <div className="edit-profile-loading">Loading your profile...</div>;
  }

  const specializations = [
    'Criminal Defense',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Civil Litigation',
    'Consumer Law',
    'Labor & Employment Law',
    'Tax Law',
    'Intellectual Property Law',
    'Constitutional Law',
    'General Practice'
  ];

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <button type="button" onClick={handleBack} className="back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="profile-heading">
          <h2>Edit Profile</h2>
          <p>Update your personal details, professional bio, and profile picture</p>
        </div>

        {error && <div className="profile-alert alert-error">{error}</div>}
        {success && (
          <div className="profile-alert alert-success">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar Upload Section */}
          <div className="avatar-section">
            <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="avatar-overlay">
                <Camera size={20} />
              </div>
            </div>

            <div className="avatar-meta">
              <h4>Profile Picture</h4>
              <p>Upload a clear portrait (JPEG or PNG, up to 5MB)</p>
              <button 
                type="button" 
                className="btn-upload-photo" 
                onClick={() => fileInputRef.current.click()}
              >
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          <hr className="divider" />

          {/* General Information */}
          <div className="form-grid">
            <div className="field-group">
              <label>Full Name *</label>
              <div className="input-icon-box">
                <User size={18} className="field-svg" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label>Email Address (Account ID)</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="field-group">
              <label>Phone Number</label>
              <div className="input-icon-box">
                <Phone size={18} className="field-svg" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label>City / Jurisdiction</label>
              <div className="input-icon-box">
                <MapPin size={18} className="field-svg" />
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Mumbai, New Delhi"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Lawyer-Specific Fields */}
          {formData.role === 'lawyer' && (
            <>
              <hr className="divider" />
              <h3 className="section-title">Lawyer Practice & Credentials</h3>

              <div className="form-grid">
                <div className="field-group">
                  <label>Legal Specialization</label>
                  <div className="input-icon-box">
                    <Briefcase size={18} className="field-svg" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    placeholder="e.g. 8 years practicing"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="field-group full-width">
                  <label>Office Address</label>
                  <div className="input-icon-box">
                    <Building2 size={18} className="field-svg" />
                    <input
                      type="text"
                      name="officeAddress"
                      placeholder="Chambers / Office address for physical consultations"
                      value={formData.officeAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {formData.barCouncilRegNumber && (
                  <div className="field-group full-width">
                    <label>Bar Council Registration Number (Verified)</label>
                    <input
                      type="text"
                      value={formData.barCouncilRegNumber}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                )}

                <div className="field-group full-width">
                  <label>Professional Bio & Background</label>
                  <textarea
                    name="bio"
                    rows={4}
                    placeholder="Describe your background, landmark cases, courts of practice, and client consultation approach..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          {formData.role === 'client' && (
            <div className="field-group full-width" style={{ marginTop: '16px' }}>
              <label>Personal Bio / Notes (Optional)</label>
              <textarea
                name="bio"
                rows={3}
                placeholder="A brief note about yourself or typical legal matters you consult on..."
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleBack} className="btn-cancel-edit">
              Cancel
            </button>
            <button type="submit" className="btn-save-profile" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
