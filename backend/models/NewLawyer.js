import mongoose from 'mongoose';

const newLawyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  
  barCouncilRegNumber: { type: String, required: true },
  stateBarCouncil: { type: String, required: true },
  yearOfEnrollment: { type: String, required: true },
  specialization: { type: String, required: true },
  officeAddress: { type: String, required: true },
  aadhaarNumber: { type: String },
  panNumber: { type: String },
  
  city: String,
  experience: String,
  bio: String,
  
  verificationDocuments: [{
    documentType: { 
      type: String, 
      enum: ['sanad', 'cop', 'aadhaar', 'pan', 'governmentId', 'other'],
      required: true 
    },
    documentUrl: { type: String, required: true },
    publicId: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  rejectionReason: String,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('NewLawyer', newLawyerSchema);