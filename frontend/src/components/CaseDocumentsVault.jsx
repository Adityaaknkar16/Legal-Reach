import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  Filter, 
  Search, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import './CaseDocumentsVault.css';

const CaseDocumentsVault = ({ currentUserId }) => {
  const [documents, setDocuments] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Upload modal state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'other',
    sharedWith: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDocumentsAndConnections();
  }, []);

  const fetchDocumentsAndConnections = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [docsRes, connsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/documents/my-documents', config),
        axios.get('http://localhost:3000/api/connect/my-connections', config).catch(() => ({ data: [] }))
      ]);

      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
      setConnections(Array.isArray(connsRes.data) ? connsRes.data : []);
    } catch (err) {
      console.error("Vault fetch error:", err);
      setStatusMessage({ type: 'error', text: 'Failed to load case documents.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: "File size exceeds 20MB limit." });
        return;
      }
      setSelectedFile(file);
      if (!uploadForm.title) {
        // Auto-populate title with file name without extension
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setUploadForm(prev => ({ ...prev, title: cleanName }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: "Please choose a file to upload." });
      return;
    }
    if (!uploadForm.title.trim()) {
      setStatusMessage({ type: 'error', text: "Please enter a document title." });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title.trim());
      formData.append('category', uploadForm.category);
      formData.append('sharedWith', uploadForm.sharedWith);
      formData.append('notes', uploadForm.notes);

      await axios.post('http://localhost:3000/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatusMessage({ type: 'success', text: 'Document uploaded to vault successfully!' });
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({ title: '', category: 'other', sharedWith: '', notes: '' });
      fetchDocumentsAndConnections();
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error("Upload error:", err);
      setStatusMessage({ type: 'error', text: err.response?.data?.message || "Failed to upload document" });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id, isFromChat) => {
    if (isFromChat) {
      setStatusMessage({ type: 'error', text: "This file was shared in a chat message and cannot be deleted from the vault directly." });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return;
    }

    if (!window.confirm("Are you sure you want to remove this document from the vault?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:3000/api/documents/${id}`, config);
      setDocuments(prev => prev.filter(d => d._id !== id));
      setStatusMessage({ type: 'success', text: 'Document removed from vault.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || "Failed to delete document" });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    }
  };

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'petition', label: 'Petitions & Affidavits' },
    { value: 'evidence', label: 'Evidence & Photos' },
    { value: 'notice', label: 'Legal Notices' },
    { value: 'contract', label: 'Contracts & Agreements' },
    { value: 'id_proof', label: 'ID & Verification Proof' },
    { value: 'other', label: 'Other Documents' }
  ];

  const getCategoryBadge = (cat) => {
    const map = {
      petition: { label: 'Petition', color: '#1e40af', bg: '#dbeafe' },
      evidence: { label: 'Evidence', color: '#15803d', bg: '#dcfce7' },
      notice: { label: 'Notice', color: '#c2410c', bg: '#ffedd5' },
      contract: { label: 'Contract', color: '#7e22ce', bg: '#f3e8ff' },
      id_proof: { label: 'ID Proof', color: '#0f766e', bg: '#ccfbf1' },
      other: { label: 'Document', color: '#475569', bg: '#f1f5f9' }
    };
    const c = map[cat] || map.other;
    return (
      <span className="category-pill" style={{ color: c.color, backgroundColor: c.bg }}>
        {c.label}
      </span>
    );
  };

  const filteredDocs = documents.filter(doc => {
    const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchSearch = !searchQuery || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="case-vault-container">
      {/* Top Header & Actions */}
      <div className="vault-top-bar">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={24} color="#2563eb" /> Case Documents Vault
          </h2>
          <p>Secure cloud repository for case files, petitions, contracts, and consultation evidence</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)} 
          className="btn-upload-vault"
        >
          <UploadCloud size={18} /> + Upload to Vault
        </button>
      </div>

      {statusMessage.text && (
        <div className={`vault-alert alert-${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {statusMessage.text}
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="vault-filter-bar">
        <div className="vault-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, file name, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="vault-category-filter">
          <Filter size={16} className="filter-icon" />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid / Empty State */}
      {loading ? (
        <div className="vault-loading">Loading secure case files...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="vault-empty-state">
          <FolderOpen size={48} className="empty-icon" />
          <h3>No Case Documents Found</h3>
          <p>
            {searchQuery || filterCategory !== 'all' 
              ? 'No documents match your search filters.' 
              : 'Upload petitions, contracts, notices, and evidence to keep your legal matters organized.'}
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary">
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="vault-grid">
          {filteredDocs.map((doc) => (
            <div key={doc._id} className="vault-card">
              <div className="card-header-row">
                {getCategoryBadge(doc.category)}
                <span className="file-size-badge">{doc.fileSize || 'PDF/Doc'}</span>
              </div>

              <div className="doc-main-info">
                <FileText size={24} className="doc-icon" />
                <div className="doc-texts">
                  <h4 title={doc.title}>{doc.title}</h4>
                  <p className="file-name" title={doc.fileName}>{doc.fileName}</p>
                </div>
              </div>

              {doc.notes && <p className="doc-notes">"{doc.notes}"</p>}

              <div className="doc-meta-info">
                <div>
                  <strong>Shared:</strong> {doc.uploadedBy?.name || 'You'} &rarr; {doc.sharedWith?.name || 'Private Vault'}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="vault-card-actions">
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-view-doc"
                >
                  <ExternalLink size={15} /> Preview / Open
                </a>
                
                {/* Delete button (only if not from chat and uploaded by current user) */}
                {!doc.isFromChat && (
                  <button 
                    onClick={() => handleDeleteDocument(doc._id, doc.isFromChat)}
                    className="btn-delete-doc"
                    title="Remove from vault"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="vault-modal">
            <div className="modal-header">
              <h3>Upload Document to Case Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="modal-form">
              {/* File Dropzone */}
              <div 
                className={`file-dropzone ${selectedFile ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                {selectedFile ? (
                  <div className="selected-file-view">
                    <FileCheck2 size={32} color="#16a34a" />
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={36} color="#3b82f6" />
                    <p>Click or drag legal file to upload</p>
                    <span>Supports PDF, DOC, DOCX, JPEG, PNG (up to 20MB)</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Lease Agreement 2026, Police Complaint Copy"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Document Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                >
                  <option value="petition">Petition / Affidavit / Court Filing</option>
                  <option value="contract">Agreement / Contract</option>
                  <option value="notice">Legal Notice / Reply</option>
                  <option value="evidence">Evidence / Photo / Statement</option>
                  <option value="id_proof">Identity / KYC Proof</option>
                  <option value="other">General Case Document</option>
                </select>
              </div>

              <div className="form-group">
                <label>Share with Connected Client / Lawyer (Optional)</label>
                <select
                  value={uploadForm.sharedWith}
                  onChange={(e) => setUploadForm({ ...uploadForm, sharedWith: e.target.value })}
                >
                  <option value="">Keep Private in My Personal Vault</option>
                  {connections.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.role === 'lawyer' ? 'Advocate' : 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes / Case Reference (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief note or court case number reference..."
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={uploading}
                >
                  {uploading ? 'Encrypting & Uploading...' : 'Upload to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDocumentsVault;
