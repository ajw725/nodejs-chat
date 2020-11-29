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

// options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on('message', ({ text, username, timestamp }) => {
  const html = Mustache.render($messageTemplate, {
    message: text,
    username,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
});

socket.on('locationmessage', ({ text, username, timestamp }) => {
  const html = Mustache.render($locationTemplate, {
    url: text,
    username,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
});

$form.addEventListener('submit', (e) => {
  e.preventDefault();
  $sendBtn.setAttribute('disabled', 'disabled');

  socket.emit('sendmessage', $messageInput.value, (res, err) => {
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

socket.emit('join', { username, room }, (_res, err) => {
  if (err) {
    alert(err);
    location.href = '/';
  } else {
    console.log(`Joined ${room}.`);
  }
});
