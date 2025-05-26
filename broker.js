const aedes = require("aedes");
import { createServer } from "net";
import { post } from "axios";

const mqttPort = 1883;
const expressServerUrl = "https://smartv2server-production.up.railway.app/data";

const server = createServer(aedes.handle);

server.listen(mqttPort, function () {
  console.log(`🚀 MQTT broker started and listening on port ${mqttPort}`);
});

aedes.on("publish", async function (packet, client) {
  if (client) {
    console.log(
      `📩 Received from client ${client.id}:`,
      packet.topic,
      packet.payload.toString()
    );

    try {
      await post(expressServerUrl, {
        clientId: client.id,
        topic: packet.topic,
        message: packet.payload.toString(),
      });
      console.log("✅ Data forwarded to Express server");
    } catch (error) {
      console.error("❌ Error sending data to Express server:", error.message);
    }
  }
});
