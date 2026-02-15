import express from 'express';
import Message from '../models/Message.js';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id || req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/contacts', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    });

    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== myId.toString()) contactIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== myId.toString()) contactIds.add(msg.receiver.toString());
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name email role');
    
    res.json(contacts);
  } catch (error) {
    console.error('Contacts error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    const users = await User.find({ _id: { $ne: myId } }).select('name email role');
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;