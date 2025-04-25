const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user-model");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const token = await user.generateToken();
    res.status(201).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/signin", async (req, res) => {
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
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

mongoose
  .connect("mongodb://localhost:27017/sachin")
  .then(() => {
    console.log("Database connection successful!");
    app.listen(5000, () => {
      console.log("Listening on port number 5000");
    });
  })
  .catch(() => {
    console.log("Database connection failed!");
  });
