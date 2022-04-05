const express = require('express');
const { ObjectID } = require('mongodb');
const Post = require('../models/postModel');
const fs = require('fs');
const path = require('path');
const router = new express.Router();
const dbURI = process.env.DB_URI || require('../secrets').dbURI;
const PostSchema = require('../models/postModel');
const User = require('../models/userModel');

const multer = require('multer');

const {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: dbURI,
  file: (req, file) => {
    return {
      filename: 'file_' + Date.now(),
      bucketName: 'uploads'
    }
  }
});
const upload = multer({ storage });


// router.get('/', async (req, res) => {
//   const posts = await Post.find().sort({ timestamp: -1 });
//   res.status(200).json(posts);
// });


router.get('/', async (req, res) => {
  const posts = await Post.find().sort({timestamp: -1 });
  res.status(200).json(posts);
  // res.render('imagesPage', { items: posts });
});

// router.post('/',upload.single('image'), async (req, res) => {
//   const posts = await Post.find().sort({ timestamp: -1 });
//   res.status(200).json(posts);
// });

router.post('/:id', upload.single('img'), async (req, res, next) => {
  const { id } = req.params;
  console.log('id reieved: ', id)

  try {
    const user = await User.findById(id).exec();
    console.log('user found: ', user)
    const newPost = new PostSchema({
      authorId: user.email,
      timestamp: new Date().getTime(),
      image:{
        name: req.body.name,
        desc: req.body.desc,
        img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + 'DSC_8880~2.JPG' /*req.file.filename*/ )),
          contentType: 'image/png'
        }
      }
    });

    PostSchema.create(newPost, (err, item) => {
      console.log('newwwwPost', newPost)
      
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.redirect('/');
        }
    });

    return newPost
      .save()
      .then((result) => {
        res.status(201).json({ result });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  } catch (err) {
    console.log (err);
    return res.status(500).json({ err });
  }
});



module.exports = router;
