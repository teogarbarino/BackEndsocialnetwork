const mongoose = require('mongoose');


// Sous-schéma pour les messages
const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma principal pour les posts
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String, // Stocker l'image en base64
    required: false
  },
  messages: [messageSchema] // Tableau de messages
});

postSchema.pre('save', async function() {
  try {
    // Met à jour les posts de l'utilisateur
    await mongoose.model('User').findByIdAndUpdate(
      this.author,
      { $push: { posts: this._id } },
      { new: true }
    );
  } catch (err) {
    console.error(err);
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
