const express = require("express");
const mqtt = require("mqtt");
const router = express.Router();
const Broker = require("../models/broker-model");
const authMiddleware = require("../middleware/auth");


  
// 1.  Handle POST request to /brokers
router.post('/brokers',authMiddleware, async (req, res) => {
    try {
      const { brokerIp, portNumber, username, password, label } = req.body;
      const broker = new Broker({ brokerIp, portNumber, username, password, label,userId: req.userId });
      await broker.save();
      res.status(201).json({
        success: true,
        data: broker,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create broker',
        error: error.message,
      });
    }
  });

// 2. Handle GET request to show all brokers
router.get('/brokers', async (req, res) => {
    try {
      const brokers = await Broker.find();
      res.status(200).json({
        success: true,
        data: brokers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch brokers',
        error: error.message,
      });
    }
  });
  
  // 3. (Optional) Handle GET request to show one broker by ID
  router.get('/brokers/:id', async (req, res) => {
    try {
      const broker = await Broker.findById(req.params.id);
      if (!broker) {
        return res.status(404).json({
          success: false,
          message: 'Broker not found',
        });
      }
      res.status(200).json({
        success: true,
        data: broker,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch broker',
        error: error.message,
      });
    }
  });


// Publish to MQTT topic (protected route)
router.post('/publish', authMiddleware, async (req, res) => {
  try {
      const { topic, message } = req.body;
      const mqttClient = req.mqttClients.get(req.userId);

      if (!mqttClient) {
          return res.status(400).json({ success: false, message: "No MQTT connection" });
      }

      mqttClient.publish(topic, message, (err) => {
          if (err) {
              return res.status(500).json({ success: false, message: "Failed to publish", error: err.message });
          }
          res.status(200).json({ success: true, message: "Message published" });
      });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

// Subscribe to MQTT topic (protected route)
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
      const { topic } = req.body;
      const mqttClient = req.mqttClients.get(req.userId);

      if (!mqttClient) {
          return res.status(400).json({ success: false, message: "No MQTT connection" });
      }

      mqttClient.subscribe(topic, (err) => {
          if (err) {
              return res.status(500).json({ success: false, message: "Failed to subscribe", error: err.message });
          }
          res.status(200).json({ success: true, message: `Subscribed to ${topic}` });
      });

      // Handle incoming messages (optional)
      mqttClient.on("message", (topic, message) => {
          console.log(`Received message on ${topic}: ${message.toString()}`);
          // You can emit this to the client via WebSocket or store it for later retrieval
      });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});
  
  module.exports = router;