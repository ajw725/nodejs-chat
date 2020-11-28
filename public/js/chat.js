const socket = io();

// elements
const $messageList = document.getElementById('messageList');
const $form = document.getElementById('chatForm');
const $messageInput = document.getElementById('chatInput');
const $sendBtn = document.getElementById('sendBtn');
const $locationBtn = document.getElementById('shareLocation');

// templates
const $messageTemplate = document.getElementById('messageTemplate').innerHTML;
const $locationTemplate = document.getElementById('locationTemplate').innerHTML;

socket.on('message', ({ text, timestamp }) => {
  const html = Mustache.render($messageTemplate, {
    message: text,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
});

socket.on('locationmessage', ({ text, timestamp }) => {
  const html = Mustache.render($locationTemplate, {
    url: text,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
});

socket.on('newuser', (msg) => {
  console.log(msg);
});

$form.addEventListener('submit', (e) => {
  e.preventDefault();
  $sendBtn.setAttribute('disabled', 'disabled');

  const msg = $messageInput.value;
  socket.emit('sendmessage', msg, (res, err) => {
    $sendBtn.removeAttribute('disabled');
    $messageInput.value = '';

    if (err) {
      console.error(err);
    } else {
      console.log(res);
    }
  });
});

$locationBtn.addEventListener('click', () => {
  const locationSvc = navigator.geolocation;
  if (!locationSvc) {
    return alert('Geolocation is not supported in this browser.');
  }

  $locationBtn.setAttribute('disabled', 'disabled');

  locationSvc.getCurrentPosition(
    (data) => {
      const { latitude, longitude } = data.coords;
      const shortLat = Math.round(100 * latitude) / 100;
      const shortLng = Math.round(100 * longitude) / 100;

      socket.emit('sendlocation', { lat: shortLat, lng: shortLng }, () => {
        $locationBtn.removeAttribute('disabled');
        console.log('location shared');
      });
    },
    (err) => {
      console.error('Failed to retrieve location:', err);
    }
  );
});
