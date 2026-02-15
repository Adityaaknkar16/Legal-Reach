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
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'ended'], 
    default: 'pending' 
  },
  startTime: { type: Date },
  endTime: { type: Date }
}, { timestamps: true });



export default mongoose.model('Call', callSchema);