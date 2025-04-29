const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routers/auth-router");
const brokerRouter = require("./routers/broker-router");
const aedes = require("aedes")();
const net = require("net");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin : "*",
    methods : ["GET","POST","PUT","PATCH","DELETE"]
}))

// Routes
app.use('/api/auth', authRouter);
app.use('/api', brokerRouter);


// MQTT Broker Setup
const mqttPort = 1883;
const mqttServer = net.createServer(aedes.handle);

mqttServer.listen(mqttPort, () => {
  console.log(`MQTT Broker running on port ${mqttPort}`);
});

// Handle MQTT client connections
aedes.on("client", (client) => {
  console.log(`Client Connected: ${client ? client.id : "unknown"}`);
});

// Handle MQTT client disconnections
aedes.on("clientDisconnect", (client) => {
  console.log(`Client Disconnected: ${client ? client.id : "unknown"}`);
});

// Handle published messages
aedes.on("publish", (packet, client) => {
  if (client) {
    console.log(
      `Message from ${client.id}: Topic: ${packet.topic}, Message: ${packet.payload.toString()}`
    );
  }
});

// Error handling for MQTT broker
aedes.on("error", (err) => {
  console.error("MQTT Broker error:", err);
});



mongoose
  .connect("mongodb+srv://vs1sachi12:dT1espceuYkgNHFR@cluster0.dcs041x.mongodb.net/confguredevice")
  .then(() => {
    console.log("Database connection successful!");
    app.listen(5000, () => {
      console.log("Listening on port number 5000");
    });
  })
  .catch(() => {
    console.log("Database connection failed!");
  });
