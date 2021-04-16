const mongoose = require("mongoose");

const follower = mongoose.Schema(
  {
    follower_iduser: {
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
      trim: true,
    },
    followers: [follower],
  },
);

module.exports = mongoose.model("followers", FollowsSchema);