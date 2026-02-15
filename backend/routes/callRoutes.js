import express from 'express';
import Call from '../models/Call.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, async (req, res) => {
  try {
    const { receiverId, callType } = req.body;

    const newCall = new Call({
      caller: req.user._id,        
      receiver: receiverId,       
      callerId: req.user._id,      
      receiverId: receiverId,      
      callType,
      status: 'pending'       
    });

    await newCall.save();
    
    await newCall.populate('caller', 'name email');
    await newCall.populate('receiver', 'name email');

    res.status(201).json({ success: true, call: newCall });
  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const callId = req.params.id;

    let updateData = { status };
    const now = new Date();

    if (status === 'accepted') {
      updateData.startTime = now;
    } 
    else if (status === 'ended') {
      updateData.endTime = now;
      
      const existingCall = await Call.findById(callId);
      if (existingCall && existingCall.startTime) {
        const durationInSeconds = Math.round((now - new Date(existingCall.startTime)) / 1000);
        updateData.duration = durationInSeconds;
      }
    }

    const updatedCall = await Call.findByIdAndUpdate(
      callId, 
      updateData,
      { new: true }
    );

    if (!updatedCall) {
        return res.status(404).json({ success: false, message: 'Call not found' });
    }

    res.json({ success: true, call: updatedCall });
  } catch (error) {
    console.error("Error updating call:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const calls = await Call.find({
            $or: [{ caller: userId }, { receiver: userId }, { callerId: userId }, { receiverId: userId }]
        })
        .populate('caller', 'name email')   
        .populate('receiver', 'name email') 
        .sort({ createdAt: -1 });            

        res.json(calls);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Error fetching call history" });
    }
});

router.post('/start', async (req, res) => {
  try {
    console.log("Incoming Call Request:", req.body);

    const callerId = req.body.caller || req.body.from || req.body.sender || req.body.callerId;
    const receiverId = req.body.receiver || req.body.to || req.body.userToCall || req.body.receiverId;

    if (!callerId || !receiverId) {
      console.error("Missing Data:", { callerId, receiverId });
      return res.status(400).json({ 
        message: "Missing caller or receiver ID", 
        received: req.body 
      });
    }

    const newCall = new Call({
      caller: callerId,
      receiver: receiverId,
      callerId: callerId,
      receiverId: receiverId,
      status: 'pending',
      startTime: new Date()
    });

    await newCall.save();
    console.log("Call saved successfully:", newCall._id);

    res.status(201).json(newCall);

  } catch (error) {
    console.error("Error in start route:", error);
    res.status(500).json({ message: "Failed to initiate call", error: error.message });
  }
});

export default router;