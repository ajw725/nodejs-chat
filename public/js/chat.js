const socket = io();

// elements
const $messageList = document.getElementById('messageList');
const $form = document.getElementById('chatForm');
const $messageInput = document.getElementById('chatInput');
const $sendBtn = document.getElementById('sendBtn');
const $locationBtn = document.getElementById('shareLocation');
const $sidebar = document.getElementById('sidebar');

// templates
const $messageTemplate = document.getElementById('messageTemplate').innerHTML;
const $locationTemplate = document.getElementById('locationTemplate').innerHTML;
const $sidebarTemplate = document.getElementById('sidebarTemplate').innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const newMsg = $messageList.lastElementChild;
  const { marginBottom } = getComputedStyle(newMsg);
  const newMsgHeight = newMsg.offsetHeight + parseInt(marginBottom);
  const visibleHeight = $messageList.offsetHeight;
  const containerHeight = $messageList.scrollHeight;
  const scrollOffset = $messageList.scrollTop + visibleHeight;

  if (containerHeight - newMsgHeight <= scrollOffset) {
    // we were already at the bottom, so we autoscroll to stay at the bottom
    $messageList.scrollTop = containerHeight;
  }
};

socket.on('message', ({ text, username, timestamp }) => {
  const html = Mustache.render($messageTemplate, {
    message: text,
    username,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationmessage', ({ text, username, timestamp }) => {
  const html = Mustache.render($locationTemplate, {
    url: text,
    username,
    timestamp: moment(timestamp).format('HH:mm:ss'),
  });
  $messageList.insertAdjacentHTML('beforeend', html);
  autoscroll();
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

socket.on('roomdata', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, { room, users });
  console.log('users:', users);
  $sidebar.innerHTML = html;
});
