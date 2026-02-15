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
  // --- Common room join for user-scoped communication ---
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  // --- Chat messaging ---
  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();
    } catch (err) {
      console.log("Message save error:", err);
    }
    io.to(data.receiver).emit("receive_message", data);
  });

  // --- Simple-Peer based calling (Audio/Video) ---
  socket.on("callUser", (data) => {
    // data: { userToCall, signalData, from, name }
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    // data: { to, signal }
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });

  // --- WebRTC signaling for ChatPage (offer/answer/ICE, call lifecycle) ---

  // Notify receiver about a new call (used for incoming popup)
  socket.on("initiate_call", (data) => {
    // data: { callerId, receiverId, callType, callId, callerName }
    io.to(data.receiverId).emit("incoming_call_offer", data);
  });

  // Forward SDP offer from caller to callee
  socket.on("send_offer", (data) => {
    // data: { to, offer, callId }
    io.to(data.to).emit("receive_offer", {
      offer: data.offer,
      callId: data.callId,
    });
  });

  // Forward SDP answer from callee to caller
  socket.on("send_answer", (data) => {
    // data: { to, answer, callId }
    io.to(data.to).emit("receive_answer", {
      answer: data.answer,
      callId: data.callId,
    });
  });

  // Forward ICE candidates between peers
  socket.on("send_ice_candidate", (data) => {
    // data: { to, candidate, callId }
    io.to(data.to).emit("receive_ice_candidate", {
      candidate: data.candidate,
      callId: data.callId,
    });
  });

  // Callee accepted WebRTC call
  socket.on("accept_call_webrtc", (data) => {
    // data: { callerId, receiverId, callId }
    io.to(data.callerId).emit("call_accepted_webrtc", data);
  });

  // Callee rejected WebRTC call
  socket.on("reject_call_webrtc", (data) => {
    // data: { callerId, callId }
    io.to(data.callerId).emit("call_rejected_webrtc", data);
  });

  // Either side ended WebRTC call
  socket.on("end_call_webrtc", (data) => {
    // data: { to, callId }
    io.to(data.to).emit("call_ended_webrtc", data);
  });

  // --- Simple call notifications used in ServicePage (non-WebRTC) ---

  socket.on("call_user", (data) => {
    // data: { to, from, type, fromName }
    io.to(data.to).emit("incoming_call", data);
  });

  socket.on("accept_call", (data) => {
    // data: { to }
    io.to(data.to).emit("call_accepted", data);
  });

  socket.on("reject_call", (data) => {
    // data: { to }
    io.to(data.to).emit("call_rejected", data);
  });

  socket.on("end_call", (data) => {
    // data: { to }
    io.to(data.to).emit("call_ended", data);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));