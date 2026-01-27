import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password, role, specialization });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    // Send user data along with token
    res.json({ 
        token, 
        user: { _id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET ALL LAWYERS (This was missing!)
router.get('/lawyers', async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' }).select('-password');
    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// CREATE TEST USER (for testing)
router.post('/test-user', async (req, res) => {
  try {
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      return res.json({ message: "Test user already exists", email: "test@example.com", password: "test123" });
    }

    const newUser = new User({ 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'test123', 
      role: 'client' 
    });
    await newUser.save();
    res.json({ message: "Test user created", email: "test@example.com", password: "test123" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;