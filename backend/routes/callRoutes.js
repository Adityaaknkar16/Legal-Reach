import express from 'express';
import Call from '../models/Call.js';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 1. Log Call Start (when a user initiates or joins a call room)
 */
router.post('/log-start', protect, async (req, res) => {
  try {
    const { receiverId, roomId, callType } = req.body;
    const callerId = req.user._id || req.user.id;

    if (!receiverId || !roomId) {
      return res.status(400).json({ message: "receiverId and roomId are required." });
    }

    // Check if a call record for this roomId already exists
    let call = await Call.findOne({ roomId });
    if (!call) {
      call = new Call({
        caller: callerId,
        receiver: receiverId,
        roomId,
        callType: callType || 'video',
        status: 'ongoing',
        startTime: new Date()
      });
      await call.save();
    }

    res.status(201).json({ message: "Call logged as started", call });
  } catch (error) {
    console.error("Call start log error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * 2. Log Call End (when a call is completed, rejected, or ended)
 */
router.post('/log-end', protect, async (req, res) => {
  try {
    const { roomId, status } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required." });
    }

    const call = await Call.findOne({ roomId }).sort({ createdAt: -1 });
    if (!call) {
      return res.status(404).json({ message: "Call record not found." });
    }

    const endTime = new Date();
    call.endTime = endTime;
    
    // Calculate duration in seconds
    const diffMs = endTime - new Date(call.startTime);
    call.duration = Math.max(0, Math.round(diffMs / 1000));
    call.status = status || (call.duration > 5 ? 'completed' : 'missed');

    await call.save();

    res.json({ message: "Call logged as ended", call });
  } catch (error) {
    console.error("Call end log error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * 3. Get Call History for the Authenticated User
 */
router.get('/history', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;

    const calls = await Call.find({
      $or: [{ caller: myId }, { receiver: myId }]
    })
      .populate('caller', 'name email role profilePic specialization')
      .populate('receiver', 'name email role profilePic specialization')
      .sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    console.error("Call history error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * 4. Get Call Statistics for Dashboard
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;

    const calls = await Call.find({
      $or: [{ caller: myId }, { receiver: myId }]
    });

    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.status === 'completed');
    const totalSeconds = completedCalls.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const videoCalls = calls.filter(c => c.callType === 'video').length;
    const audioCalls = calls.filter(c => c.callType === 'audio').length;

    res.json({
      totalCalls,
      completedCalls: completedCalls.length,
      totalMinutes,
      videoCalls,
      audioCalls
    });
  } catch (error) {
    console.error("Call stats error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
