import express from 'express';
import Message from '../models/Message.js';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

// Upload document/photo attachment for chat
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'legalreach/chat_attachments',
      resource_type: 'auto'
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Chat upload error:", error);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
});
// past chats

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
// user id

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

//fetch user

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