import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import requestRoutes from './routes/requestRoutes.js'; 

import Message from './models/Message.js';

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
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));