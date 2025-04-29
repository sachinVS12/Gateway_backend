const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routers/auth-router");
const brokerRouter = require("./routers/broker-router");
const brokermodel = require("./models/broker-model")
const mqtt = require("mqtt");
const WebSocket = require("ws");
const aedes = require("aedes")();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin : "*",
    methods : ["GET","POST","PUT","PATCH","DELETE"]
}))

// Store MQTT clients per user (key: userId, value: mqttClient)
const mqttClients = new Map();

// Routes
app.use('/api/auth', authRouter);
app.use('/api', brokerRouter);


// Middleware to pass mqttClients to routes
app.use((req, res, next) => {
  req.mqttClients = mqttClients;
  next();
});

// const aedesInstance = aedes();
// const mqttServer = net.createServer(aedesInstance.handle);
// mqttServer.listen(1883, () => {
//     console.log("Aedes MQTT broker running on port 1883");
// });


mongoose
  .connect("mongodb+srv://vs1sachi12:dT1espceuYkgNHFR@cluster0.dcs041x.mongodb.net/confguredevice")
  .then(() => {
    console.log("Database connection successful!");
    app.listen(5000, () => {
      console.log("Listening on port number 5000");
    })
  })
  .catch(() => {
    console.log("Database connection failed!");
  });

  
  
