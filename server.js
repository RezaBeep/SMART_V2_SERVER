const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Serve static files (like index.html) from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// API route to receive data
app.post("/data", (req, res) => {
  const value = req.body.value;
  console.log("Received:", value);
  io.emit("newData", value); // Broadcast to all clients
  res.sendStatus(200);
});

// Socket.IO listener
io.on("connection", (socket) => {
  console.log("Client connected");
});

// Use Railway-provided port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
