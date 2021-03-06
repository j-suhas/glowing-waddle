const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  },
  name: {
    type: String,
    required: true
  },
  avatarColor: {
    type: Number,
    required: true
  },
  bio: {
    type: String
  },
  createdAt: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  passwordConfirm: {
    type: String,
    required: true
  },
  showEmail: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
