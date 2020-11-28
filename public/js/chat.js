const socket = io();

socket.on('countupdate', (count) => {
  console.log('count:', count);
});

document.getElementById('increment').addEventListener('click', () => {
  socket.emit('increment');
});
