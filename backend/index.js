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

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", { 
      signal: data.signalData, 
      from: data.from, 
      name: data.name 
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));