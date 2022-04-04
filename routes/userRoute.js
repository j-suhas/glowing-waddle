const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const validateLogin = require('../validation/validateLogin');
const validateSignup = require('../validation/validateSignup');
const User = require('../models/userModel');

const router = new express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// Sign up a user
router.post('/signup', async (req, res) => {
  const { errors, isValid } = validateSignup(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.find({ email: req.body.email }).exec();
    if (user.length > 0) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    return bcrypt.hash(req.body.password, 10, (error, hash) => {
      if (error) {
        return res.status(500).json({ error });
      }
      const newUser = new User({
        avatarColor: Math.floor(Math.random() * 18) + 1,
        createdAt: new Date().getTime(),
        email: req.body.email,
        name: req.body.name,
        password: hash,
        passwordConfirm: hash,
        showEmail: true
      });
      return newUser
        .save()
        .then((result) => {
          res.status(201).json({ result });
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

// Log in a user
router.post('/login', async (req, res) => {
  const { errors, isValid } = validateLogin(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
      return res.status(401).json({
        email: 'Could not find email.'
      });
    }

    return bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: 'Auth failed.'
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            avatarColor: user.avatarColor,
            createdAt: user.createdAt,
            name: user.name,
            email: user.email,
            showEmail: user.showEmail,
            userId: user._id
          },
          process.env.JWT_KEY || require('../secrets').jwtKey,
          {
            expiresIn: '1h'
          }
        );
        return res.status(200).json({
          message: 'Auth successful.',
          token
        });
      }
      return res.status(401).json({
        password: 'Wrong password. Try again.'
      });
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// Get a user by their id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

// Get a user by their name
router.get('/name/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const user = await User.find({"name":{ "$regex" : name , "$options" : "i"}});

    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

// Update a user's information
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          avatarColor: req.body.avatarColor,
          bio: req.body.bio || '',
          email: req.body.email,
          name: req.body.name,
          showEmail: req.body.showEmail
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err) => {
        if (err != null && err.name === 'MongoError' && err.code === 11000) {
          return res
            .status(500)
            .send({ message: 'This email is already in use.' });
        }
      }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const token = jwt.sign(
      {
        avatarColor: user.avatarColor,
        bio: user.bio,
        createdAt: user.createdAt,
        name: user.name,
        email: user.email,
        showEmail: user.showEmail,
        userId: user._id
      },
      process.env.JWT_KEY || require('../secrets').jwtKey,
      {
        expiresIn: '24h'
      }
    );

    return res.json({ user, token });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    await User.remove({ _id: req.params.id }).exec();
    res.status(200).json({ message: 'Successfully deleted user.' });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

module.exports = router;
