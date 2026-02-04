import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import requestRoutes from './routes/requestRoutes.js'; 
import callRoutes from './routes/callRoutes.js';

import Message from './models/Message.js';
import Call from './models/Call.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connect', requestRoutes);
app.use('/api/calls', callRoutes); 


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", async (data) => {

    try {
        const newMessage = new Message(data);
        await newMessage.save();
    } catch(err) {
        console.log("Message save error:", err);
    }

    io.to(data.receiver).emit("receive_message", data);
  });

  socket.on("call_user", (data) => {
    io.to(data.to).emit("incoming_call", {
      from: data.from,
      fromName: data.fromName,
      type: data.type
    });
  });

  socket.on("accept_call", (data) => {
    io.to(data.to).emit("call_accepted");
  });

  socket.on("reject_call", (data) => {
    io.to(data.to).emit("call_rejected");
  });

  socket.on("end_call", (data) => {
    io.to(data.to).emit("call_ended");
  });

  // ========== AUDIO/VIDEO CALL HANDLERS (NEW) ==========
  // User joins their call room
  socket.on("user_available", (userId) => {
    socket.join(`call_${userId}`);
    console.log(`User ${userId} is available for calls`);
  });

  // Initiate audio/video call
  socket.on("initiate_call", (data) => {
    const { callerId, receiverId, callType, callId } = data;
    // Notify receiver about incoming call
    io.to(`call_${receiverId}`).emit("incoming_call_offer", {
      callerId,
      callType,
      callId,
      callerName: data.callerName
    });
    console.log(`Call initiated: ${callerId} -> ${receiverId} (${callType})`);
  });

  // Send WebRTC offer
  socket.on("send_offer", (data) => {
    const { to, offer, callId } = data;
    io.to(`call_${to}`).emit("receive_offer", {
      offer,
      callId
    });
  });

  // Send WebRTC answer
  socket.on("send_answer", (data) => {
    const { to, answer, callId } = data;
    io.to(`call_${to}`).emit("receive_answer", {
      answer,
      callId
    });
  });

  // Send ICE candidate
  socket.on("send_ice_candidate", (data) => {
    const { to, candidate, callId } = data;
    io.to(`call_${to}`).emit("receive_ice_candidate", {
      candidate,
      callId
    });
  });

  // Accept call
  socket.on("accept_call_webrtc", (data) => {
    const { callerId, receiverId, callId } = data;
    io.to(`call_${callerId}`).emit("call_accepted_webrtc", {
      callId,
      receiverId
    });
    console.log(`Call accepted: ${callId}`);
  });

  // Reject call
  socket.on("reject_call_webrtc", (data) => {
    const { callerId, callId } = data;
    io.to(`call_${callerId}`).emit("call_rejected_webrtc", {
      callId
    });
  });

  // End call
  socket.on("end_call_webrtc", (data) => {
    const { to, callId } = data;
    io.to(`call_${to}`).emit("call_ended_webrtc", {
      callId
    });
    console.log(`Call ended: ${callId}`);
  });

  // User leaves call room
  socket.on("leave_call", (userId) => {
    socket.leave(`call_${userId}`);
    console.log(`User ${userId} left call room`);
  });
  // ========== END AUDIO/VIDEO CALL HANDLERS ==========
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));