import express from 'express';
import CaseDocument from '../models/CaseDocument.js';
import Message from '../models/Message.js';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

/**
 * 1. Upload a new Case Document to the Vault
 */
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file to upload." });
    }

    const { title, category, sharedWith, notes } = req.body;
    if (!title || !title.trim()) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Document title is required." });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'legalreach/case_vault',
      resource_type: 'auto'
    });

    // Cleanup local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const fileSizeFormatted = req.file.size > 1024 * 1024 
      ? (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (req.file.size / 1024).toFixed(0) + ' KB';

    const newDoc = new CaseDocument({
      title: title.trim(),
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatted,
      category: category || 'other',
      uploadedBy: req.user._id,
      sharedWith: sharedWith && sharedWith !== '' ? sharedWith : null,
      notes: notes || ''
    });

    await newDoc.save();

    const populated = await CaseDocument.findById(newDoc._id)
      .populate('uploadedBy', 'name email role')
      .populate('sharedWith', 'name email role');

    res.status(201).json({
      message: "Document uploaded to Case Vault successfully!",
      document: populated
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Document upload error:", error);
    res.status(500).json({ message: "Failed to upload document", error: error.message });
  }
});

/**
 * 2. Get all Vault documents for current user (unified with chat attachments)
 */
router.get('/my-documents', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;

    // Fetch documents uploaded directly to the Vault
    const vaultDocs = await CaseDocument.find({
      $or: [{ uploadedBy: myId }, { sharedWith: myId }]
    })
      .populate('uploadedBy', 'name email role')
      .populate('sharedWith', 'name email role')
      .sort({ createdAt: -1 });

    // Also fetch files shared in chat messages to unify the vault view
    const chatFiles = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
      fileUrl: { $exists: true, $ne: null }
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 });

    // Format chat files as vault items
    const formattedChatDocs = chatFiles.map(msg => ({
      _id: msg._id,
      title: msg.fileName || (msg.fileType?.startsWith('image/') ? 'Chat Image' : 'Chat Attachment'),
      fileName: msg.fileName || 'Attachment',
      fileUrl: msg.fileUrl,
      fileType: msg.fileType || 'application/octet-stream',
      fileSize: 'Chat File',
      category: msg.fileType?.startsWith('image/') ? 'evidence' : 'other',
      uploadedBy: msg.sender,
      sharedWith: msg.receiver,
      notes: 'Shared via Chat Room',
      createdAt: msg.createdAt,
      isFromChat: true
    }));

    // Merge and sort chronologically
    const allDocs = [...vaultDocs, ...formattedChatDocs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allDocs);
  } catch (error) {
    console.error("Fetch documents error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * 3. Delete a Vault document
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await CaseDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const myId = (req.user._id || req.user.id).toString();
    if (doc.uploadedBy.toString() !== myId) {
      return res.status(403).json({ message: "Not authorized to delete this document" });
    }

    await CaseDocument.findByIdAndDelete(req.params.id);
    res.json({ message: "Document removed from Case Vault" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
