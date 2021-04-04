const mongoose = require("mongoose");

const publi = mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  likes: {
    type: Number,
    trim: true,
    default: 0,
  },
  createdate: {
    type: Date,
    default: Date.now(),
  },
  modifieddate: {
    type: Date,
    default: Date.now(),
  },
});

const PostSchema = mongoose.Schema({
  iduser: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  posts: [publi],
});

module.exports = mongoose.model("posts", PostSchema);
