const express = require('express');
const auth = require('../middleware/auth');
const Conversation = require('../models/conversation');

const router = express.Router();

// Créez une nouvelle conversation
router.post('/conversations', auth, async (req, res) => {
  const { userId } = req.body;
  const conversation = new Conversation({
    participants: [req.user.id, userId],
    messages: []
  });

  try {
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Obtenez les conversations d'un utilisateur
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id });
    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Ajoutez un message à une conversation
router.post('/conversations/:id/messages', auth, async (req, res) => {
  const { content } = req.body;
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const newMessage = {
      sender: req.user.id,
      content,
      createdAt: new Date()
    };
    conversation.messages.push(newMessage);
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
