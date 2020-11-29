const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { buildMessage } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, cb) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(undefined, 'Username already taken');
    }

    socket.join(user.room);
    socket.emit('message', buildMessage('Welcome to the chat!', 'Admin'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        buildMessage(`${username} has joined the chat`, 'Admin')
      );

    io.to(user.room).emit('roomdata', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on('sendmessage', (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb(null, 'Profanity is not allowed!');
    }

    const user = getUser(socket.id);
    if (!user) {
      return cb(undefined, 'User not found');
    }

    const { username, room } = user;
    io.to(room).emit('message', buildMessage(msg, username));
    cb('Message delivered');
  });

  socket.on('sendlocation', ({ lat, lng }, cb) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;

    const user = getUser(socket.id);
    if (!user) {
      return cb(undefined, 'User not found');
    }

    const { username, room } = user;
    io.to(room).emit('locationmessage', buildMessage(url, username));
    cb();
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    if (!user) {
      return;
    }

    const { username, room } = user;
    removeUser(socket.id);
    socket.broadcast
      .to(room)
      .emit('message', buildMessage(`${username} has left the chat`, 'Admin'));

    io.to(room).emit('roomdata', {
      room,
      users: getUsersInRoom(room),
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});
