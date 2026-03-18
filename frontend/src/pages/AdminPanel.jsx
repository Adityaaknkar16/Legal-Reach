import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [allLawyers, setAllLawyers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/login');
      return;
    }
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const pendingRes = await axios.get('http://localhost:3000/api/new-lawyer/pending', config);
      setPendingLawyers(pendingRes.data);

      const allRes = await axios.get('http://localhost:3000/api/new-lawyer/all', config);
      setAllLawyers(allRes.data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      alert('Failed to fetch lawyers');
    }
  };

  const handleApprove = async (lawyerId) => {
    if (!window.confirm('Are you sure you want to approve this lawyer? They will be added to the main system.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/new-lawyer/approve/${lawyerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Lawyer approved and added to system!');
      fetchLawyers();
      setSelectedLawyer(null);
    } catch (error) {
      console.error('Error approving lawyer:', error);
      alert('Failed to approve lawyer');
    }
  };

  const handleReject = async (lawyerId) => {
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/new-lawyer/reject/${lawyerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Lawyer application rejected');
      fetchLawyers();
      setSelectedLawyer(null);
    } catch (error) {
      console.error('Error rejecting lawyer:', error);
      alert('Failed to reject lawyer');
    }
  };

  const handleDelete = async (lawyerId) => {
    if (!window.confirm('Are you sure you want to permanently delete this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/new-lawyer/${lawyerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application deleted');
      fetchLawyers();
      setSelectedLawyer(null);
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      alert('Failed to delete application');
    }
  };

  // Updated to handle both Cloudinary URLs and legacy Base64
  const handleViewDocument = (documentUrl) => {
    // Cloudinary URL - just open directly
    if (documentUrl.startsWith('http')) {
      window.open(documentUrl, '_blank');
    } else {
      // Legacy Base64 - convert to blob
      const base64Data = documentUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const mimeType = documentUrl.split(',')[0].split(':')[1].split(';')[0];
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel - Lawyer Applications</h1>
        <button className="logout-btn" onClick={() => {
          localStorage.clear();
          navigate('/login');
        }}>Logout</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications ({pendingLawyers.length})
        </button>
        <button 
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All Applications ({allLawyers.length})
        </button>
      </div>

      <div className="lawyer-list">
        {activeTab === 'pending' && pendingLawyers.length === 0 && (
          <p className="empty-state">No pending applications</p>
        )}

        {activeTab === 'pending' && pendingLawyers.map(lawyer => (
          <div key={lawyer._id} className="lawyer-card">
            <div className="lawyer-info">
              <h3>{lawyer.name}</h3>
              <p><strong>Email:</strong> {lawyer.email}</p>
              <p><strong>Bar Council Reg:</strong> {lawyer.barCouncilRegNumber}</p>
              <p><strong>State:</strong> {lawyer.stateBarCouncil}</p>
              <p><strong>Specialization:</strong> {lawyer.specialization}</p>
              <p><strong>City:</strong> {lawyer.city}</p>
              <p><strong>Phone:</strong> {lawyer.phone}</p>
              <p className="status-badge status-pending">Status: {lawyer.status}</p>
            </div>
            <div className="lawyer-actions">
              <button className="btn-view" onClick={() => setSelectedLawyer(lawyer)}>
                View Details
              </button>
              <button className="btn-approve" onClick={() => handleApprove(lawyer._id)}>
                Approve
              </button>
              <button className="btn-reject" onClick={() => handleReject(lawyer._id)}>
                Reject
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'all' && allLawyers.map(lawyer => (
          <div key={lawyer._id} className="lawyer-card">
            <div className="lawyer-info">
              <h3>{lawyer.name}</h3>
              <p><strong>Email:</strong> {lawyer.email}</p>
              <p><strong>Bar Council Reg:</strong> {lawyer.barCouncilRegNumber}</p>
              <p><strong>Specialization:</strong> {lawyer.specialization}</p>
              <p><strong>City:</strong> {lawyer.city}</p>
              <p className={`status-badge status-${lawyer.status}`}>
                Status: {lawyer.status}
              </p>
            </div>
            <div className="lawyer-actions">
              <button className="btn-view" onClick={() => setSelectedLawyer(lawyer)}>
                View Details
              </button>
              {lawyer.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(lawyer._id)}>
                    Approve
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(lawyer._id)}>
                    Reject
                  </button>
                </>
              )}
              <button className="btn-delete" onClick={() => handleDelete(lawyer._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedLawyer && (
        <div className="modal-overlay" onClick={() => setSelectedLawyer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLawyer.name}</h2>
              <button className="modal-close" onClick={() => setSelectedLawyer(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <h3>Personal Information</h3>
                <p><strong>Email:</strong> {selectedLawyer.email}</p>
                <p><strong>Phone:</strong> {selectedLawyer.phone}</p>
                <p><strong>City:</strong> {selectedLawyer.city}</p>
              </div>

              <div className="info-section">
                <h3>Professional Details</h3>
                <p><strong>Bar Council Registration Number:</strong> {selectedLawyer.barCouncilRegNumber}</p>
                <p><strong>State Bar Council:</strong> {selectedLawyer.stateBarCouncil}</p>
                <p><strong>Year of Enrollment:</strong> {selectedLawyer.yearOfEnrollment}</p>
                <p><strong>Specialization:</strong> {selectedLawyer.specialization}</p>
                <p><strong>Experience:</strong> {selectedLawyer.experience} years</p>
                <p><strong>Office Address:</strong> {selectedLawyer.officeAddress}</p>
              </div>

              <div className="info-section">
                <h3>Identity Verification (KYC)</h3>
                {selectedLawyer.aadhaarNumber && <p><strong>Aadhaar Number:</strong> {selectedLawyer.aadhaarNumber}</p>}
                {selectedLawyer.panNumber && <p><strong>PAN Number:</strong> {selectedLawyer.panNumber}</p>}
                {!selectedLawyer.aadhaarNumber && !selectedLawyer.panNumber && <p>No KYC details provided</p>}
              </div>

              <div className="info-section">
                <h3>Bio</h3>
                <p>{selectedLawyer.bio || 'No bio provided'}</p>
              </div>

              <div className="info-section">
                <h3>Verification Documents</h3>
                {selectedLawyer.verificationDocuments?.length > 0 ? (
                  <div className="documents-grid">
                    {selectedLawyer.verificationDocuments.map((doc, index) => {
                      // Check if it's a Cloudinary URL or Base64
                      const isCloudinaryURL = doc.documentUrl?.startsWith('http');
                      const isPDF = doc.documentUrl?.includes('.pdf') || doc.documentUrl?.includes('application/pdf');
                      const isImage = doc.documentUrl?.includes('image/') || doc.documentUrl?.match(/\.(jpg|jpeg|png)$/i);
                      
                      return (
                        <div key={index} className="document-item">
                          <p><strong>Type:</strong> {doc.documentType.toUpperCase()}</p>
                          <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          
                          <div style={{ marginTop: '15px' }}>
                            <button 
                              className="btn-download"
                              onClick={() => handleViewDocument(doc.documentUrl)}
                              style={{ 
                                padding: '10px 20px',
                                backgroundColor: '#1e3a8a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              {isCloudinaryURL ? '🔗 View Document' : (isPDF ? '📄 View PDF' : '🖼️ View Image')}
                            </button>
                          </div>

                          {/* Preview thumbnail for Cloudinary images */}
                          {isCloudinaryURL && isImage && (
                            <div style={{ marginTop: '15px' }}>
                              <img 
                                src={doc.documentUrl} 
                                alt={`${doc.documentType}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  border: '1px solid #ddd',
                                  objectFit: 'contain'
                                }}
                                onClick={() => handleViewDocument(doc.documentUrl)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No documents uploaded</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {selectedLawyer.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(selectedLawyer._id)}>
                    Approve & Add to System
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(selectedLawyer._id)}>
                    Reject Application
                  </button>
                </>
              )}
              <button onClick={() => setSelectedLawyer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;