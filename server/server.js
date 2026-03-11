const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { connectDB } = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* Proper CORS setup */
const CLIENT_URL = process.env.CLIENT_URL || "https://chat-app-1-9di1.onrender.com";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

// API routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Serve frontend build
const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));

app.get("/api", (req, res) => {
  res.send("Chat App API is running...");
});

// React routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// HTTP + Socket.io server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
    }
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat || !chat.users) {
      return console.log("chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
