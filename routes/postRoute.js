const express = require('express');
const { ObjectID } = require('mongodb');
const Post = require('../models/postModel');
const fs = require('fs');
const path = require('path');

const router = new express.Router();

const multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
let upload = multer({ storage: storage });


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

router.post('/', upload.single('img'), (req, res, next) => {

  var obj = {
      name: req.body.name,
      desc: req.body.desc,
      img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/png'
      }
  }

  imgModel.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          res.redirect('/');
      }
  });
});


module.exports = router;
