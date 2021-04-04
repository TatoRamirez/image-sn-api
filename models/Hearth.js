const mongoose = require("mongoose");

const userlike = mongoose.Schema(
  {
    iduser: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { _id: false }
);

const HearthSchema = mongoose.Schema(
  {
    idpost: {
      type: String,
      unique: true,
      trim: true,
    },
    UsersLikes: [userlike],
  },
);

module.exports = mongoose.model("hearths", HearthSchema);
