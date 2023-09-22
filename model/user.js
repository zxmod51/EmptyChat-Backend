const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String},
  username: { type: String},
  password: { type: String },
  isAdmin: { type: Boolean},
});

module.exports = mongoose.model("user", userSchema);