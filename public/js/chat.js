const socket = io();

const messageList = document.getElementById('messageList');

socket.on('message', (msg) => {
  const newItem = document.createElement('li');
  newItem.textContent = msg;
  messageList.appendChild(newItem);
});

const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value;
  socket.emit('sendMessage', msg);
  input.value = '';
});
