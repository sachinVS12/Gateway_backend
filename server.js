const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routers/auth-router");
const brokerRouter = require("./routers/broker-router");

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
