const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
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
  },
  location: {
    type: Object
  },
  fileURL:{
    type: String,
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId, 
  }
});

module.exports = mongoose.model('Post', PostSchema);
