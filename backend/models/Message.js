import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  fileUrl: { type: String },
  fileType: { type: String },
  fileName: { type: String },
  encrypted: { type: String },
  iv: { type: String },
  authTag: { type: String },
  isEncrypted: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);