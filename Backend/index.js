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
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// ==============================
// HEALTH CHECK
// ==============================

app.get("/", (req, res) => {
  res.json({
    message: "Chat Server Running 🚀",
  });
});


// ==============================
// DATABASE
// ==============================

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


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );


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

const onlineUsers = new Map();

io.on("connection", (socket) => {

  console.log("✅ User Connected:", socket.id);


  // ==============================
  // USER ONLINE
  // ==============================

  socket.on("user_online", (username) => {

    socket.username = username;

    onlineUsers.set(username, socket.id);


    io.emit(
      "online_users",
      Array.from(onlineUsers.keys())
    );


    console.log(
      "🟢 Online Users:",
      [...onlineUsers.keys()]
    );

  });



  // ==============================
  // JOIN ROOM
  // ==============================

  socket.on("join_room", async (room) => {

    socket.join(room);


    try {

      const history = await Message.find({
        room
      }).sort({
        createdAt: 1
      });


      socket.emit(
        "chat_history",
        history.map((msg)=>({
          ...msg.toObject(),
          id: msg._id
        }))
      );


    } catch(error){

      console.log(
        "History Error:",
        error
      );

    }

  });




  // ==============================
  // SEND MESSAGE
  // ==============================

  socket.on(
    "send_message",
    async(data)=>{

      try {


        const message = await Message.create(data);


        const savedMessage = {

          ...message.toObject(),

          id: message._id

        };


        io.to(data.room).emit(
          "receive_message",
          savedMessage
        );


        console.log(
          "✅ Message Saved:",
          message._id
        );


      }
      catch(error){

        console.log(
          "Message Error:",
          error
        );

      }


    }
  );





  // ==============================
  // TYPING
  // ==============================


  socket.on(
    "typing",
    (data)=>{

      socket
      .to(data.room)
      .emit(
        "typing",
        data
      );


    }
  );



  socket.on(
    "stop_typing",
    (data)=>{


      socket
      .to(data.room)
      .emit(
        "stop_typing",
        data
      );


    }
  );





  // ==============================
  // MESSAGE STATUS
  // ==============================


  socket.on(
    "message_status",
    async(data)=>{


      try{


        await Message.findByIdAndUpdate(
          data.id,
          {
            status:data.status
          }
        );


        socket
        .to(data.room)
        .emit(
          "message_status",
          data
        );


      }
      catch(error){

        console.log(
          "Status Error:",
          error
        );

      }


    }
  );






  // ==============================
  // DELETE MESSAGE
  // ==============================


  socket.on(
    "delete_message",
    async(data)=>{


      try{


        await Message.findByIdAndUpdate(
          data.id,
          {
            deleted:true
          }
        );


        io.to(data.room)
        .emit(
          "delete_message",
          data
        );


      }
      catch(error){

        console.log(
          "Delete Error:",
          error
        );

      }


    }
  );





  // ==============================
  // REACTION
  // ==============================


  socket.on(
    "react_message",
    (data)=>{


 socket.to(data.room)
.emit(
 "react_message",
 data
);


    }
  );





  // ==============================
  // DISCONNECT
  // ==============================


  socket.on(
    "disconnect",
    ()=>{


      if(socket.username){

        onlineUsers.delete(
          socket.username
        );

      }


      io.emit(
        "online_users",
        Array.from(
          onlineUsers.keys()
        )
      );


      console.log(
        "❌ Disconnected:",
        socket.id
      );


    }
  );


});

// ==============================
// SERVER
// ==============================

const PORT = process.env.PORT || 7777;


server.listen(
  PORT,
  "0.0.0.0",
  ()=>{
    console.log(
      `🚀 Server Running On Port ${PORT}`
    );
  })