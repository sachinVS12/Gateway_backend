const express = require("express");
const router = express.Router();
const Broker = require("../models/broker-model");


  
// Handle POST request to /brokers
router.post('/brokers', async (req, res) => {
    try {
      const { brokerIp, portNumber, username, password } = req.body;
      const broker = new Broker({ brokerIp, portNumber, username, password });
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
  
  module.exports = router;