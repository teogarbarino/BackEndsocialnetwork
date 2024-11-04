const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/users');
const auth = require('../middleware/auth');

// Route POST pour l'inscription avec une photo en Base64
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password should be at least 6 characters long').isLength({ min: 6 }),
  check('photo', 'Photo is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Invalid inputs', errors: errors.array() });
  }

  const { name, email, password, photo } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      photo
    });

    
   

    await user.save();

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route GET pour récupérer les informations de l'utilisateur connecté
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route Post pour récupérer les modifiers de l'utilisateurs
router.put('/user/modify', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate incoming data (optional but recommended)
    const { image, username } = req.body; // Destructure only allowed fields
    if (!image || !username) {
      return res.status(400).json({ message: 'Missing required fields: image and username' });
    }

    // Fetch the user to update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only image and username
    user.image = image;
    user.username = username;

    // Save the updated user document
    const updatedUser = await user.save();

    // Return a successful response with updated information
    res.json({
      username: updatedUser.username,
      image: updatedUser.image,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' }); // Provide a more informative error message
  }
});


module.exports = router;
