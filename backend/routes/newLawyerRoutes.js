import express from 'express';
import NewLawyer from '../models/NewLawyer.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `LegalReach <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register new lawyer - UPDATED FOR CLOUDINARY
router.post('/register', upload.fields([
  { name: 'sanad', maxCount: 1 },
  { name: 'cop', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      name, email, password, specialization, city, phone, experience, bio, 
      barCouncilRegNumber, stateBarCouncil, 
      yearOfEnrollment, officeAddress, aadhaarNumber, panNumber 
    } = req.body;
    
    const existingLawyer = await NewLawyer.findOne({ email });
    if (existingLawyer) {
      return res.status(400).json({ message: "Application already submitted" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered in system" });
    }

    // Check if all required documents are uploaded
    if (!req.files || !req.files.sanad || !req.files.cop || !req.files.governmentId) {
      return res.status(400).json({ message: "All three documents are required" });
    }
    
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Upload documents to Cloudinary
    const verificationDocuments = [];

    try {
      // Upload Sanad
      const sanadResult = await cloudinary.uploader.upload(req.files.sanad[0].path, {
        folder: 'legalreach/verification_documents',
        resource_type: 'auto'
      });
      verificationDocuments.push({
        documentType: 'sanad',
        documentUrl: sanadResult.secure_url,
        publicId: sanadResult.public_id
      });
      fs.unlinkSync(req.files.sanad[0].path);

      // Upload COP
      const copResult = await cloudinary.uploader.upload(req.files.cop[0].path, {
        folder: 'legalreach/verification_documents',
        resource_type: 'auto'
      });
      verificationDocuments.push({
        documentType: 'cop',
        documentUrl: copResult.secure_url,
        publicId: copResult.public_id
      });
      fs.unlinkSync(req.files.cop[0].path);

      // Upload Government ID
      const govIdResult = await cloudinary.uploader.upload(req.files.governmentId[0].path, {
        folder: 'legalreach/verification_documents',
        resource_type: 'auto'
      });
      verificationDocuments.push({
        documentType: aadhaarNumber ? 'aadhaar' : (panNumber ? 'pan' : 'governmentId'),
        documentUrl: govIdResult.secure_url,
        publicId: govIdResult.public_id
      });
      fs.unlinkSync(req.files.governmentId[0].path);

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      // Clean up any uploaded files
      if (req.files.sanad && fs.existsSync(req.files.sanad[0].path)) {
        fs.unlinkSync(req.files.sanad[0].path);
      }
      if (req.files.cop && fs.existsSync(req.files.cop[0].path)) {
        fs.unlinkSync(req.files.cop[0].path);
      }
      if (req.files.governmentId && fs.existsSync(req.files.governmentId[0].path)) {
        fs.unlinkSync(req.files.governmentId[0].path);
      }

      return res.status(500).json({ message: "Failed to upload documents" });
    }
    
    const newLawyer = new NewLawyer({
      name,
      email,
      password: hashedPassword,
      specialization,
      city,
      phone,
      experience,
      bio,
      verificationDocuments,
      barCouncilRegNumber,
      stateBarCouncil,
      yearOfEnrollment,
      officeAddress,
      aadhaarNumber,
      panNumber,
      status: 'pending'
    });
    
    await newLawyer.save();
    
    // Send confirmation email
    await sendEmail(
      email,
      'Application Received - LegalReach',
      `Dear ${name},\n\nYour lawyer registration application has been received.\n\nYou will be notified via email once your application is reviewed and approved.\n\nThank you,\nLegalReach Team`
    );
    
    res.status(201).json({ message: "Application submitted successfully. You will be notified once approved." });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Clean up files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }
    
    res.status(500).json({ message: "Server Error" });
  }
});

// Get pending applications
router.get('/pending', verifyAdmin, async (req, res) => {
  try {
    const pendingLawyers = await NewLawyer.find({ status: 'pending' });
    res.json(pendingLawyers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all applications
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const allLawyers = await NewLawyer.find();
    res.json(allLawyers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ APPROVE LAWYER
router.put('/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const newLawyer = await NewLawyer.findById(req.params.id);
    if (!newLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    const existingUser = await User.findOne({ email: newLawyer.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists in system" });
    }

    const user = new User({
      name: newLawyer.name,
      email: newLawyer.email,
      password: newLawyer.password,
      role: 'lawyer',
      specialization: newLawyer.specialization,
      city: newLawyer.city,
      phone: newLawyer.phone,
      experience: newLawyer.experience,
      bio: newLawyer.bio,
      barCouncilRegNumber: newLawyer.barCouncilRegNumber,
      stateBarCouncil: newLawyer.stateBarCouncil,
      yearOfEnrollment: newLawyer.yearOfEnrollment,
      officeAddress: newLawyer.officeAddress,
      aadhaarNumber: newLawyer.aadhaarNumber,
      panNumber: newLawyer.panNumber,
      isVerified: true,
      verificationStatus: 'approved'
    });

    await user.save({ validateBeforeSave: true });

    console.log('✅ Lawyer approved:', {
      email: user.email,
      isVerified: user.isVerified,
      passwordStartsWith: user.password.substring(0, 10)
    });

    await sendEmail(
      newLawyer.email,
      'Application Approved - LegalReach',
      `Dear ${newLawyer.name},\n\nCongratulations! Your lawyer application has been approved.\n\nYou can now login to LegalReach:\nEmail: ${newLawyer.email}\n\nLogin here: http://localhost:5173/login\n\nWelcome aboard!\n\nBest regards,\nLegalReach Team`
    );

    newLawyer.status = 'approved';
    await newLawyer.save();

    res.json({ 
      message: "Lawyer approved and added to system", 
      user: {
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Approval error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Reject application
router.put('/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const newLawyer = await NewLawyer.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: rejectionReason || 'Application did not meet requirements'
      },
      { new: true }
    );
    
    if (!newLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    await sendEmail(
      newLawyer.email,
      'Application Update - LegalReach',
      `Dear ${newLawyer.name},\n\nThank you for your interest in LegalReach.\n\nUnfortunately, we are unable to approve your application at this time.\n\nReason: ${newLawyer.rejectionReason}\n\nYou may reapply after addressing these concerns.\n\nBest regards,\nLegalReach Team`
    );

    res.json({ message: "Lawyer application rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete application - WITH CLOUDINARY CLEANUP
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const lawyer = await NewLawyer.findById(req.params.id);
    
    if (lawyer && lawyer.verificationDocuments) {
      for (const doc of lawyer.verificationDocuments) {
        if (doc.publicId) {
          try {
            await cloudinary.uploader.destroy(doc.publicId);
            console.log('✅ Deleted from Cloudinary:', doc.publicId);
          } catch (error) {
            console.error('❌ Error deleting from Cloudinary:', error);
          }
        }
      }
    }

    await NewLawyer.findByIdAndDelete(req.params.id);
    res.json({ message: "Lawyer application deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;