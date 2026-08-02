import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Message from "./models/Message.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ Mongoose Error:", err);
});

// ==============================
// AUTH ROUTES
// ==============================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup Successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      username: user.username,
      message: "Login Successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
    });
  }
});

// ==============================
// SOCKET.IO
// ==============================

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  socket.on("join_room", async (room) => {
    socket.join(room);

    try {
      const history = await Message.find({ room }).sort({
        createdAt: 1,
      });

      socket.emit("chat_history", history);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create(data);

      io.to(data.room).emit("receive_message", message);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});

// ==============================
// SERVER
// ==============================

const PORT = process.env.PORT || 7777;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On http://localhost:${PORT}`);
});