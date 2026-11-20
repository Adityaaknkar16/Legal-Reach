import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  caller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roomId: {
    type: String,
    required: true
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video'
  },
  status: { 
    type: String, 
    enum: ['ongoing', 'completed', 'missed', 'rejected'], 
    default: 'ongoing' 
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date 
  }
}, { timestamps: true });

export default mongoose.model('Call', callSchema);
