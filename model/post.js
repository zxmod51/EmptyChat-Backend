const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  title: { type: String},
  body: { type: String},
  author: { username: String, profileImgPath: String}
}, {timestamps: true});

module.exports = mongoose.model("Post", postSchema);