import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/user.js';
import { protect } from '../middleware/authMiddleware.js';
import { notifyLawyerNewAppointment, notifyClientAppointmentStatus } from '../utils/emailService.js';

const router = express.Router();

// Book an appointment (Client)
router.post('/book', protect, async (req, res) => {
  try {
    const { lawyerId, date, time, notes } = req.body;
    const clientId = req.user._id || req.user.id;

    if (!lawyerId || !date || !time) {
      return res.status(400).json({ message: "Lawyer, date, and time are required." });
    }

    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({ message: "Lawyer not found." });
    }

    const appointment = new Appointment({
      client: clientId,
      lawyer: lawyerId,
      date,
      time,
      notes: notes || '',
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('lawyer', 'name email specialization city officeAddress')
      .populate('client', 'name email phone');

    // Trigger asynchronous email alert to lawyer
    notifyLawyerNewAppointment({
      lawyerEmail: lawyer.email,
      lawyerName: lawyer.name,
      clientName: req.user.name || populatedAppointment.client?.name,
      clientPhone: req.user.phone || populatedAppointment.client?.phone,
      date,
      time,
      notes
    }).catch(err => console.error("Email send error:", err));

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get user's appointments (for both client and lawyer)
router.get('/my-appointments', protect, async (req, res) => {
  try {
    const myId = req.user._id || req.user.id;
    const query = req.user.role === 'lawyer' 
      ? { lawyer: myId } 
      : { client: myId };

    const appointments = await Appointment.find(query)
      .populate('lawyer', 'name email specialization city phone officeAddress')
      .populate('client', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update appointment status (Confirm, Cancel, Complete)
router.put('/status/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const myId = (req.user._id || req.user.id).toString();

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const isAuthorized = appointment.client.toString() === myId || appointment.lawyer.toString() === myId;
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to update this appointment." });
    }

    appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(id)
      .populate('lawyer', 'name email specialization city phone officeAddress')
      .populate('client', 'name email phone');

    // Trigger email alert to client regarding appointment status
    if (['confirmed', 'cancelled'].includes(status) && updated.client?.email) {
      notifyClientAppointmentStatus({
        clientEmail: updated.client.email,
        clientName: updated.client.name,
        lawyerName: updated.lawyer?.name || 'Legal Counsel',
        date: updated.date,
        time: updated.time,
        status
      }).catch(err => console.error("Email send error:", err));
    }

    res.json({ message: `Appointment ${status}`, appointment: updated });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
