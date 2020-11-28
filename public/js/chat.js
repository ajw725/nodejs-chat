const socket = io();

const messageList = document.getElementById('messageList');

socket.on('message', (msg) => {
  const newItem = document.createElement('li');
  newItem.textContent = msg;
  messageList.appendChild(newItem);
});

socket.on('newuser', (msg) => {
  console.log(msg);
});

const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value;
  socket.emit('sendmessage', msg);
  input.value = '';
});

const locationBtn = document.getElementById('shareLocation');
locationBtn.addEventListener('click', () => {
  const locationSvc = navigator.geolocation;
  if (!locationSvc) {
    return alert('Geolocation is not supported in this browser.');
  }

  const loc = locationSvc.getCurrentPosition(
    (data) => {
      const { latitude, longitude } = data.coords;
      const shortLat = Math.round(100 * latitude) / 100;
      const shortLng = Math.round(100 * longitude) / 100;
      socket.emit('sendlocation', { lat: shortLat, lng: shortLng });
    },
    (err) => {
      console.error('Failed to retrieve location:', err);
    }
  );
});
