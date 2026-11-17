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
import newLawyerRoutes from './routes/newLawyerRoutes.js';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware.js';
import { encryptMessage, generateRoomKey } from './utils/cryptoUtils.js';

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

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connect', requestRoutes);
app.use('/api/calls', callRoutes); 
app.use('/api/new-lawyer', newLawyerRoutes);

// MongoDB connection with optimized settings for Atlas
const mongoDBOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true,
  compressors: ['snappy'],
};

mongoose.connect(process.env.MONGO_URI, mongoDBOptions)
  .then(() => console.log("✓ MongoDB Connected"))
  .catch((err) => {
    console.error("✗ MongoDB Connection Failed:");
    console.error("  Error:", err.message);
    if (err.reason) {
      console.error("  Reason:", err.reason.type);
      console.error("  Servers found:", err.reason.servers.size);
    }
    console.error("\nTroubleshooting steps:");
    console.error("1. Check MongoDB Atlas IP Whitelist includes your IP");
    console.error("2. Verify credentials in MONGO_URI");
    console.error("3. Ensure the cluster is running and not paused");
  });

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.userId} joined room ${userId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      if (socket.userId !== data.sender) {
        socket.emit("error", { message: "Unauthorized: sender mismatch" });
        return;
      }

      const roomKey = generateRoomKey(data.sender, data.receiver);
      const encryptedData = encryptMessage(data.message, roomKey);

      const messageToSave = {
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        encrypted: encryptedData.encrypted,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
        isEncrypted: true,
        createdAt: data.createdAt || new Date()
      };

      const newMessage = new Message(messageToSave);
      await newMessage.save();

      io.to(data.receiver).emit("receive_message", {
        ...data,
        encrypted: encryptedData.encrypted,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag
      });

    } catch (err) {
      console.log("Message save error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("notify_call", (data) => {
    io.to(data.receiverId).emit("incoming_call_notification", data);
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });

  socket.on("initiate_call", (data) => {
    io.to(data.receiverId).emit("incoming_call_offer", data);
  });

  socket.on("send_offer", (data) => {
    io.to(data.to).emit("receive_offer", {
      offer: data.offer,
      callId: data.callId,
    });
  });

  socket.on("send_answer", (data) => {
    io.to(data.to).emit("receive_answer", {
      answer: data.answer,
      callId: data.callId,
    });
  });

  socket.on("send_ice_candidate", (data) => {
    io.to(data.to).emit("receive_ice_candidate", {
      candidate: data.candidate,
      callId: data.callId,
    });
  });

  socket.on("accept_call_webrtc", (data) => {
    io.to(data.callerId).emit("call_accepted_webrtc", data);
  });

  socket.on("reject_call_webrtc", (data) => {
    io.to(data.callerId).emit("call_rejected_webrtc", data);
  });

  socket.on("end_call_webrtc", (data) => {
    io.to(data.to).emit("call_ended_webrtc", data);
  });

  socket.on("call_user", (data) => {
    io.to(data.to).emit("incoming_call", data);
  });

  socket.on("accept_call", (data) => {
    io.to(data.to).emit("call_accepted", data);
  });

  socket.on("reject_call", (data) => {
    io.to(data.to).emit("call_rejected", data);
  });

  socket.on("end_call", (data) => {
    io.to(data.to).emit("call_ended", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));