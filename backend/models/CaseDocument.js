import mongoose from 'mongoose';

const caseDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: String
  },
  category: {
    type: String,
    enum: ['petition', 'evidence', 'notice', 'contract', 'id_proof', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('CaseDocument', caseDocumentSchema);
