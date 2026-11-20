import 'dotenv/config';
import express from 'express';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `LegalReach <${process.env.EMAIL_USER}>`,
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

// Request Password Reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't disclose user existence for security, or send standard message
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "Password reset OTP sent to your email", email });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Verify OTP and Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otpExpires)) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get logged-in user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Update profile details and optional photo
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone, city, bio, experience, officeAddress, specialization } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;
    if (experience !== undefined) user.experience = experience;
    if (officeAddress !== undefined) user.officeAddress = officeAddress;
    if (specialization !== undefined) user.specialization = specialization;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'legalreach/profile_pics',
        resource_type: 'image'
      });
      user.profilePic = uploadResult.secure_url;
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
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