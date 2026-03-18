import express from 'express';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'legalreach.official@gmail.com',
    pass: 'veboewheavzjuacd'
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: 'LegalReach <legalreach.official@gmail.com>',
      to: email,
      subject: 'Verify Your Account - LegalReach',
      text: `Your OTP for verification is: ${otp}`
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const tempUsers = new Map();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    tempUsers.set(email, {
      name,
      email,
      password,
      role,
      specialization,
      otp,
      otpExpires
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "OTP sent to email", email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser) return res.status(400).json({ message: "Registration not found or expired" });
    
    if (tempUser.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (tempUser.otpExpires < Date.now()) {
      tempUsers.delete(email);
      return res.status(400).json({ message: "OTP Expired" });
    }

    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
      specialization: tempUser.specialization,
      isVerified: true
    });

    await user.save();
    tempUsers.delete(email);

    res.status(200).json({ message: "Verification Successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role === 'lawyer' && !user.isVerified) {
      return res.status(403).json({ 
        message: "Your account is pending admin approval. Please check your email for updates." 
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    console.log('Login successful:', user.email, '| Role:', user.role, '| Verified:', user.isVerified);

    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/lawyers', async (req, res) => {
  try {
    const { name, city, specialization } = req.query;
    
    let query = { role: 'lawyer', isVerified: true };
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    if (specialization) {
      query.specialization = specialization;
    }
    
    const lawyers = await User.find(query).select('-password');
    res.json(lawyers);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;