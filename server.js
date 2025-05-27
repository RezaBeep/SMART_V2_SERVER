require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");

const server = express();

let latestData = null;

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ MQTT connected");

  mqttClient.subscribe("#", (err) => {
    if (err) {
      console.error("Subscription error:", err);
    }
  });
});

mqttClient.on("message", (topic, message) => {
  console.log(`📩 Message received [${topic}]: ${message.toString()}`);
  latestData = {
    topic,
    message: message.toString(),
    timestamp: new Date(),
  };
});

server.use(express.json());

server.post("/data", (req, res) => {
  console.log("Received MQTT Data:", req.body);
  res.sendStatus(200);
});

// Use Railway-provided port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
