const express = require("express");

const server = express();
const port = 3000;

server.use(express.json());

server.post("/mqtt-data", (req, res) => {
  console.log("Received MQTT Data:", req.body);
  res.sendStatus(200);
});

// Use Railway-provided port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
