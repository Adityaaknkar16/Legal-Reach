import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'lawyer'], default: 'client' },
  

  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);