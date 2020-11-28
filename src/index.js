const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const server = http.createServer(app);
const ioServer = socketio(server);

ioServer.on('connection', (socket) => {
  socket.emit('message', 'Welcome to the chat!');
  socket.broadcast.emit('message', 'A new user has joined the chat!');

  socket.on('sendmessage', (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb(null, 'Profanity is not allowed!');
    }

    ioServer.emit('message', msg);
    cb('Message delivered');
  });

  socket.on('sendlocation', (coords, cb) => {
    const url = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    ioServer.emit('locationmessage', url);
    cb();
  });

  socket.on('disconnect', () => {
    ioServer.emit('message', 'A user has left the chat.');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});
