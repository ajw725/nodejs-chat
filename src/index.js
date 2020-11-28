const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const server = http.createServer(app);
const ioServer = socketio(server);

let counter = 0;

ioServer.on('connection', (socket) => {
  console.log('handling connection');

  socket.emit('countupdate', counter);

  socket.on('increment', () => {
    counter++;
    ioServer.emit('countupdate', counter);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});
