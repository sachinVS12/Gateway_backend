const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: [true, "name is required"],
    // },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, "x-auth-token", {
    expiresIn: "1d",
  });
};

userSchema.methods.verifypass = async function (userEnteredPass) {
  return bcryptjs.compare(userEnteredPass, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;