const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Client connected");
});

app.post("/data", (req, res) => {
  const value = req.body.value;
  console.log("Received:", value);
  io.emit("newData", value); // broadcast to clients
  res.sendStatus(200);
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
