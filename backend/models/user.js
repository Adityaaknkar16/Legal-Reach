import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'lawyer', 'admin'], default: 'client' },
  specialization: String,
  city: String,
  phone: String,
  experience: String,
  bio: String,
  profilePic: { type: String, default: '' },
  barCouncilRegNumber: String,
  stateBarCouncil: String,
  yearOfEnrollment: String,
  officeAddress: String,
  aadhaarNumber: String,
  panNumber: String,
  isVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  otp: String,
  otpExpires: Date
}, { timestamps: true });


userSchema.pre('save', async function(next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }

 
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    console.log('Password already hashed, skipping hash');
    return next();
  }

  // Hash new password
  console.log(' Hashing new password');
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

export default mongoose.model('User', userSchema);