const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  username: { type: String },
  password: { type: String },
  isAdmin: { type: Boolean },
  avatar: { 
    pathToAvatar: { type: String },
    public_id: { type: String }
  },
});

module.exports = mongoose.model("user", userSchema);