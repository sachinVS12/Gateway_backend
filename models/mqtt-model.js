// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   topic: String,
//   message: String,
//   timestamp: { type: Date, default: Date.now },


// const Message = mongoose.model("Message", messageSchema);

// // Example: Save message in broker-router.js
// mqttClient.on("message", async (topic, message) => {
//   const msg = new Message({
//     topic,
//     message: message.toString(),
//   });
//   await msg.save();
//   console.log(`Saved message to MongoDB: ${message.toString()}`);
// });