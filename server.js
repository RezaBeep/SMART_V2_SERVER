require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const WebSocket = require("ws");

const server = express();
server.use(express.json());
server.use(express.static("public"));

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function message(data) {
    console.log("Received:", data);
  });
});

function broadcast(msg) {
  // Broadcast to all connected clients
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

let env = {
  type: "",
  temp: 0,
  rh: 0,
  lat: 0,
  long: 0,
  alt: 0,
};

let heart = {
  type: "",
  hr: 0,
  spo2: 0,
};

let acc = {
  type: "ACC",
  ev: "",
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
  let user_id = topic.split("/")[0];
  let msg_type = topic.split("/")[1];
  let data = message.toString();
  try {
    if (msg_type == "ACC") {
      broadcast(
        JSON.stringify({
          userid: user_id,
          data: { type: "ACC", ev: message.toString() },
        })
      );
    } else {
      const parsed = JSON.parse(data);
      parsed["type"] = msg_type;
      if (topic.includes("ENV")) {
        env = parsed;
        broadcast(JSON.stringify({ userid: user_id, data: env }));
      } else if (topic.includes("POX")) {
        heart = parsed;
        broadcast(JSON.stringify({ userid: user_id, data: heart }));
      }
      console.log(`📩 Message received [${topic}]: ${data}`);
    }
  } catch (e) {
    console.error("Invalid JSON from MQTT");
  }
});

// Serve latest data
server.get("/api/data", (req, res) => {
  console.log("cinet");

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
