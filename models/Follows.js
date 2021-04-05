const mongoose = require("mongoose");

const follow = mongoose.Schema(
  {
    follow_iduser: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { _id: false }
);

const FollowsSchema = mongoose.Schema(
  {
    iduser: {
      type: String,
      unique: true,
      trim: true,
    },
    follows: [follow],
  },
);

module.exports = mongoose.model("follows", FollowsSchema);