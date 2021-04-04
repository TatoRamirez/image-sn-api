const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  userdesc: {
    type: String,
    trim: true,
  },
  birthdate: {
    type: Date,
    required: true,
    trim: true,
  },
  personalemail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  nationality: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  createdate: {
    type: Date,
    default: Date.now(),
  },
  modifieddate: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
  },
  terms: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("users", UserSchema);