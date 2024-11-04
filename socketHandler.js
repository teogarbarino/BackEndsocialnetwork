const Conversation = require('./models/conversation');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('joinRoom', ({ userId, conversationId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
    });

    socket.on('message', async (data) => {
      try {
        const { conversationId, content, senderId } = data;
        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Vérifier si l'utilisateur est un participant
        if (!conversation.participants.includes(senderId)) {
          socket.emit('error', { message: 'Unauthorized to send message' });
          return;
        }

        const newMessage = {
          sender: senderId,
          content,
          createdAt: new Date()
        };

        conversation.messages.push(newMessage);
        conversation.updatedAt = new Date();
        await conversation.save();

        // Émettre le message à tous les participants
        io.to(conversationId).emit('message', newMessage);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports = setupSocket;