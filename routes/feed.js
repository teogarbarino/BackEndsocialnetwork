const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/posts');

const feedRouter = express.Router();

// Route pour générer et obtenir le feed de l'utilisateur
feedRouter.get('/users/feed', auth, async (req, res) => {
  try {
    console.log(`Fetching feed for user ID: ${req.user._id}`);

    // L'utilisateur est déjà disponible grâce au middleware auth
    const user = req.user;

    const posts = await Post.find().select('_id');
    console.log(`Found ${posts.length} posts`);

    // S'il y a plus de 10 posts, sélectionnez-en 10 au hasard
    let feedPosts;
    if (posts.length > 10) {
      feedPosts = [];
      const selectedIndexes = new Set();
      while (selectedIndexes.size < 10) {
        const randomIndex = Math.floor(Math.random() * posts.length);
        if (!selectedIndexes.has(randomIndex)) {
          selectedIndexes.add(randomIndex);
          feedPosts.push(posts[randomIndex]._id);
        }
      }
    } else {
      // Si moins de 10 posts, utilisez-les tous
      feedPosts = posts.map(post => post._id);
    }

    // Met à jour le feed de l'utilisateur
    user.feed = feedPosts;
    await user.save();

    // Renvoyez le feed mis à jour
    res.json({ feed: user.feed });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = feedRouter;