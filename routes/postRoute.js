const express = require('express');
const { ObjectID } = require('mongodb');
const Post = require('../models/postModel');
const fs = require('fs');
const path = require('path');
const router = new express.Router();
const dbURI = process.env.DB_URI || require('../secrets').dbURI;
const PostSchema = require('../models/postModel');
const User = require('../models/userModel');
const geoip = require('fast-geoip');
const multer = require('multer');

const {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: dbURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-file-name-${file.originalname}`;
        return filename;
    }

    return {
        bucketName: "photos",
        filename: `${Date.now()}-file-name-${file.originalname}`,
    };
},
});
const upload = multer({ storage });


// router.get('/', async (req, res) => {
//   const posts = await Post.find().sort({ timestamp: -1 });
//   res.status(200).json(posts);
// });


router.get('/', async (req, res) => {
  const posts = await Post.find().sort({timestamp: -1 });
  res.status(200).json(posts);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  res.status(200).json(post);
})

router.post("/:id/upload", upload.single("file"), async (req, res) => {
  const { id } = req.params;

  try {
    if (req.file === undefined) return res.send("you must select a file.");
    const imgUrl = `http://localhost:8080/file/${req.file.filename}`;
    // return res.send(imgUrl);
    const user = await User.findById(id).exec();
    // console.log('user found: ', user)
    const ip = req.body.ip;
    // console.log('ip rcvd: ', ip)
    
    const geo = await geoip.lookup(ip);
    // console.log('geo obj: ', geo);
    // console.log('"req obj": ', JSON.stringify(req.body));
    // console.log('file obj: ', req.file);
    // console.log('FileName: ', req.file.originalname);
    
    const newPost = new PostSchema({
      authorId: user._id,
      timestamp: new Date().getTime(),
      fileURL: imgUrl,
      location: geo,
      fileId: req.file.id
    });
    
    PostSchema.create(newPost, (err, item) => {
      console.log('newwwwPost', newPost)
      
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.status(201).json({ newPost });

            // res.redirect('/');
        }
    });

    // return newPost
    //   .save()
    //   .then((result) => {
    //     res.status(201).json({ result });
    //   })
    //   .catch((err) => {
    //     console.log(err)
    //     res.status(500).json({ error: err });
    //   });
  } catch (err) {
    console.log ('catch....');
    console.log(err)
    return res.status(500).json({ err });
  }
});



module.exports = router;
