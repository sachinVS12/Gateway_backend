const express = require("express");
const mqtt = require("mqtt");
const router = express.Router();
const Broker = require("../models/broker-model");


  
// 1.  Handle POST request to /brokers
router.post('/brokers', async (req, res) => {
    try {
      const { brokerIp, portNumber, username, password, label } = req.body;
      const broker = new Broker({ brokerIp, portNumber, username, password, label });
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


// MQTT Client for publishing messages
const mqttClient = mqtt.connect("mqtt://localhost:1883", {
  clientId: "express-publisher",
});

mqttClient.on("connect", () => {
  console.log("Express MQTT publisher connected");
});

mqttClient.on("error", (err) => {
  console.error("Express MQTT publisher error:", err);
});

// Endpoint to publish MQTT messages
router.post("/publish", (req, res) => {
  const { topic, message } = req.body;

  if (!topic || !message) {
    return res
      .status(400)
      .json({ error: "Topic and message are required" });
  }

  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error("Publish error:", err);
      return res.status(500).json({ error: "Failed to publish message" });
    }
    res.status(200).json({ success: "Message published successfully" });
  });
});

// Example endpoint to subscribe to a topic (for demonstration)
router.post("/subscribe", (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  mqttClient.subscribe(topic, { qos: 1 }, (err) => {
    if (err) {
      console.error("Subscribe error:", err);
      return res
        .status(500)
        .json({ error: "Failed to subscribe to topic" });
    }
    res.status(200).json({ success: `Subscribed to ${topic}` });
  });
});

// Log incoming MQTT messages (for subscribed topics)
mqttClient.on("message", (topic, message) => {
  console.log(`Received on ${topic}: ${message.toString()}`);
  // Optionally, store messages in MongoDB or handle them as needed
});
  
  module.exports = router;