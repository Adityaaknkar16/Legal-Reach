import express from 'express';
import Call from '../models/Call.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get call history for a user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }]
    })
      .populate('callerId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      calls
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call history'
    });
  }
});

// Create a new call record
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { receiverId, callType } = req.body;
    const callerId = req.user.id;

    if (!receiverId || !callType) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and callType are required'
      });
    }

    if (!['audio', 'video'].includes(callType)) {
      return res.status(400).json({
        success: false,
        message: 'callType must be audio or video'
      });
    }

    const newCall = new Call({
      callerId,
      receiverId,
      callType,
      status: 'pending'
    });

    const savedCall = await newCall.save();
    const populatedCall = await savedCall.populate('callerId', 'name email');

    res.status(201).json({
      success: true,
      call: populatedCall
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating call'
    });
  }
});

// Update call status
router.put('/:callId/status', authMiddleware, async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['pending', 'accepted', 'rejected', 'ended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Verify user is involved in the call
    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this call'
      });
    }

    call.status = status;

    if (status === 'accepted' && !call.startTime) {
      call.startTime = new Date();
    }

    if (status === 'ended' && call.startTime) {
      call.endTime = new Date();
      call.duration = Math.floor((call.endTime - call.startTime) / 1000);
    }

    const updatedCall = await call.save();

    res.status(200).json({
      success: true,
      call: updatedCall
    });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating call status'
    });
  }
});

// Get specific call details
router.get('/:callId', authMiddleware, async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await Call.findById(callId)
      .populate('callerId', 'name email')
      .populate('receiverId', 'name email');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    res.status(200).json({
      success: true,
      call
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call details'
    });
  }
});

export default router;
