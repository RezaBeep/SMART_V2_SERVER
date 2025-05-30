require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");

const server = express();
server.use(express.json());
server.use(express.static("public"));

let latestData = {
  hr: 0,
  spo2: 0,
  temp: 0,
  lat: 0,
  long: 0,
};

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ MQTT connected");

  mqttClient.subscribe("#", (err) => {
    if (err) {
      console.error("Subscription error:", err);
    }
  });
});

let last_msg = 0;
let online_status = false;

mqttClient.on("message", (topic, message) => {
  // console.log(`📩 Message received [${topic}]: ${message.toString()}`);
  last_msg = new Date().getTime();
  online_status = true;
  let data = message.toString();
  try {
    const parsed = JSON.parse(data);
    latestData = parsed;
    console.log(`📩 Message received [${topic}]: ${data}`);
  } catch (e) {
    // console.error("Invalid JSON from MQTT");
    // Try fixing
    data = data
      .replace(/"lat":\s*,/, '"lat":0.0,')
      .replace(/"long":\s*}/, '"long":0.0}');
    try {
      latestData = JSON.parse(data);
      console.log(`📩 Message received [${topic}]: ${data}`);
    } catch (e2) {
      console.error("Failed to fix and parse data:", e2);
      return;
    }
  }
});

// Serve latest data
server.get("/api/data", (req, res) => {
  if (new Date().getTime() - last_msg > 20000) {
    latestData["online"] = false;
  } else {
    latestData["online"] = true;
  }
  res.json(latestData);
  latestData = {
    hr: 0,
    spo2: 0,
    temp: 0,
    lat: latestData["lat"],
    long: latestData["long"],
  };
});

// Use Railway-provided port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
