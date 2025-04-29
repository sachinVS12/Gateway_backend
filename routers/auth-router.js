const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mqtt = require("mqtt");
const User = require("../models/user-model");


//signup
router.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.create({ email, password });
      const token = await user.generateToken();
      res.status(201).json({ success: true, token });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

// Signin
router.post("/signin", async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          return res
              .status(400)
              .json({ success: false, message: "Email not registered" });
      }
      const validate = await user.verifypass(password);
      if (!validate) {
          return res
              .status(400)
              .json({ success: false, message: "Invalid password" });
      }
      const token = await user.generateToken();

      // Find the user's broker (assuming one broker per user for simplicity)
      const broker = await Broker.findOne({ /* Add query, e.g., userId: user._id or other logic */ });
      if (!broker) {
          return res
              .status(400)
              .json({ success: false, message: "No broker configured for this user" });
      }

      // Create MQTT connection
      const mqttOptions = {
          host: broker.brokerIp,
          port: broker.portNumber,
          username: broker.username,
          password: broker.password,
          clientId: `user_${user._id}_${Date.now()}` // Unique client ID
      };

      const mqttClient = mqtt.connect(mqttOptions);

      mqttClient.on("connect", () => {
          console.log(`MQTT connected for user ${user._id} to broker ${broker.brokerIp}:${broker.portNumber}`);
          // Subscribe to a default topic (optional)
          mqttClient.subscribe("test/topic", (err) => {
              if (err) {
                  console.error("Subscription error:", err);
              }
          });
      });

      mqttClient.on("error", (err) => {
          console.error(`MQTT error for user ${user._id}:`, err);
      });

      mqttClient.on("close", () => {
          console.log(`MQTT disconnected for user ${user._id}`);
      });

      // Store MQTT client in the Map
      req.mqttClients.set(user._id.toString(), mqttClient);

      res.status(200).json({ success: true, token });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/test", (req, res) => {
  res.status(200).json({
      success: true,
      message: "Auth route is working",
  });
});

module.exports = router;


