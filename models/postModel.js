const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  authorId: {
    type: String,
    required: true
  },
  image:{
    name: String,
    desc: String,
    img: {
        data: Buffer,
        contentType: String
    }
  },
  timestamp: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Post', PostSchema);
