import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import requestRoutes from './routes/requestRoutes.js'; // <--- Only ONE import here now

import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// MOUNT ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connect', requestRoutes); // <--- Connection logic enabled

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Socket Logic
io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", async (data) => {
    // Save to DB
    try {
        const newMessage = new Message(data);
        await newMessage.save();
    } catch(err) {
        console.log("Message save error:", err);
    }
    // Send to Receiver
    io.to(data.receiver).emit("receive_message", data);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));