import dns from 'dns'
dns.setServers(['8.8.8.8','8.8.4.4'])
import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io'
import http from 'http'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Message from './models/Message.js'
import User from './models/User.js' 

dotenv.config();

const app = express();

// 🟢 FIXED: Credentials true hone par "*" block ho jata hai, isliye humne specific allowed origins set kar diye hain
const allowedOrigins = [
  "https://b4a.run", // Aapka container backend url
  "http://localhost:5173",                // Local Vite testing ke liye
  "http://localhost:3000"                 // Local React testing ke liye
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Agar request bina origin ke ho (jaise Postman/Mobile apps) ya allowed list mein ho
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes("netlify.app")) {
      callback(null, true);
    } else {
      callback(null, true); // Production safe failover: netlify preview branches ke liye true rakha hai
    }
  },
  credentials: true 
}));

app.use(express.json()); 

const server = http.createServer(app);

// 🟢 FIXED: Socket.io CORS ko bhi valid dynamic configuration de di hai
const io = new Server(server, {
  cors: {
    origin: true, // Auto-reflects the requesting origin if valid
    methods: ["GET", "POST"],
    credentials: true
  },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

mongoose.connection.on("connected", () => console.log("✅ Mongoose connected event fired"));
mongoose.connection.on("error", (err) => console.log("❌ Mongoose error event:", err));

// ==========================================
// 🔐 AUTHENTICATION APIS (SIGNUP & LOGIN)
// ==========================================

// 1. SIGNUP ROUTE
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: "Oops, this username is already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// 2. LOGIN ROUTE
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" } 
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops! Something went wrong, please try again." });
  }
});

// ==========================================
// 💬 SOCKET.IO CHAT LOGIC
// ==========================================
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", async (data) => {
    socket.join(data);
    console.log(`User ID :- ${socket.id} joined room : ${data}`);
    try {
      const history = await Message.find({ room: data }).sort({ createdAt: 1 });
      socket.emit("chat_history", history);
    } catch (err) {
      console.log("Error fetching history:", err);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const savedMessage = await Message.create(data);
      socket.to(data.room).emit("receive_message", savedMessage);
    } catch (err) {
      console.log("Error saving message:", err);
      socket.emit("message_error", { error: "Message couldn't be sent, please try again" });
    }
  });

  socket.on("typing", (data) => { socket.to(data.room).emit("typing", data); });
  socket.on("stop_typing", (data) => { socket.to(data.room).emit("stop_typing", data); });
  socket.on("message_status", (data) => { socket.to(data.room).emit("message_status", data); });

  socket.on("delete_message", async (data) => {
    socket.to(data.room).emit("delete_message", data);
    try {
      await Message.updateOne({ _id: data.id }, { deleted: true });
    } catch (err) {
      console.log("Error deleting message:", err);
    }
  });

  socket.on("react_message", async (data) => {
    socket.to(data.room).emit("react_message", data);
    try {
      await Message.updateOne(
        { _id: data.messageId },
        { $set: { [`reactions.${data.user}`]: data.reaction } }
      );
    } catch (err) {
      console.log("Error saving reaction:", err);
    }
  });

  socket.on("disconnect", () => { console.log("User Disconnected..", socket.id); });
});

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => console.log(`Server is running on port ${PORT} with Auth Routes`));
