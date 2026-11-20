import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lawyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
