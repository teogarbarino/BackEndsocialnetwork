const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/users');
const { check, validationResult } = require('express-validator');
const Post = require('../models/posts');

// Route POST pour créer un nouveau post
router.post('/post', [
  auth,
  
],async (req, res) => {
  
  console.log("je passe ici ");

  const { title, description, image, lat, lon } = req.body;
  console.log("je passe ici ");

  try {
    // Construire l'objet position s'il est fourni
    let position; 
    if (lat && lon) {
      position = {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      };
    }
    //
    const author = await User.findById(req.user.id);

    console.log("didididid: "+author);

    // Créer le post avec ou sans la position et l'image
    const post = new Post({
      title,
      description,
      author: author.id,
      position: position,
      image: image // Accepter l'image Base64 directement
    });

    await post.save();

    res.json({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      position: post.position,
      image: post.image
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route POST pour ajouter un message à un post existant
router.post('/posts/:id/messages', [
  auth,
  [
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Invalid inputs', errors: errors.array() });
  }

  try {
    // Trouver le post par ID et ajouter le message
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newMessage = {
      author: req.user.id,
      text: req.body.text
    };

    post.messages.push(newMessage);

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/posts/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name photo'); // Récupère tous les posts de la base de données
  
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
