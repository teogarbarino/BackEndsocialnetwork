const express = require('express'); 
const connectDB = require('./db.js'); 
const postRouter = require('./routes/posts');
const http = require('http');
const socketio = require('socket.io');

require('dotenv').config(); 
connectDB();

const app = express(); 
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000; 

const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const feedRouter =require('./routes/feed');
const conversationRouter = require('./routes/conversation');
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));



app.use(express.json()); 

app.use('/api',userRouter);
app.use('/api', feedRouter);
app.use('/api', authRouter);
app.use('/api',postRouter);
app.use('/api', conversationRouter);

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Join a conversation
  socket.on('joinRoom', ({ userId, conversationId }) => {
    socket.join(conversationId);
    console.log(`${userId} joined room: ${conversationId}`);
  });

  // Receive message
  socket.on('sendMessage', ({ conversationId, message }) => {
    io.to(conversationId).emit('message', message);
  });

  // Disconnect user
  socket.on('disconnect', () => {
    console.log('User had left');
  });
  socket.on('video data', ({ conversationId, data }) => {
    // Broadcast video data to others in the room
    socket.to(conversationId).emit('video data', data);
  });

  // Disconnect user
  socket.on('disconnect', () => {
    console.log('User had left');
  });
});

app.listen(PORT, () => { 
    console.log(`Serveur démarré sur le port ${PORT}`); 
  });   module.exports = app;
 