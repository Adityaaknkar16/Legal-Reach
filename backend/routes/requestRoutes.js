import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', protect, async (req, res) => {
  const { lawyerId } = req.body;
  const clientId = req.user._id || req.user.id;

  try {
    const existingRequest = await Request.findOne({ sender: clientId, receiver: lawyerId });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent." });
    }

    const newRequest = await Request.create({ sender: clientId, receiver: lawyerId });
    res.status(201).json({ message: "Request sent successfully!", request: newRequest });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    const requests = await Request.find({ receiver: myId, status: 'pending' })
      .populate('sender', 'name email');
    res.json(requests);
  } catch (error) {
    console.error("Pending requests error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/accept/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    const myId = req.user._id || req.user.id;
    if (request.receiver.toString() !== myId.toString()) {
      return res.status(401).json({ message: "Not authorized." });
    }

    request.status = 'accepted';
    await request.save();

    res.json({ message: "Request Accepted. You can now chat!" });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:userId', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    const request = await Request.findOne({
      $or: [
        { sender: myId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: myId }
      ]
    });
    
    if (!request) return res.json({ status: 'none' });
    res.json({ status: request.status });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-connections', protect, async (req, res) => {
    try {
        const myId = req.user._id || req.user.id;
        
        const connections = await Request.find({
            $or: [{ sender: myId }, { receiver: myId }],
            status: 'accepted'
        }).populate('sender receiver', 'name email role');

        const connectedUsers = connections.map(conn => {
            return conn.sender._id.toString() === myId.toString() ? conn.receiver : conn.sender;
        });

        res.json(connectedUsers);
    } catch (error) {
        console.error("My connections error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;