const users = [];

const addUser = (user) => {
  let { username, room } = user;
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return { error: 'Username and room are required' };
  }

  const idx = users.findIndex(
    (u) => u.username === username && u.room === room
  );
  if (idx >= 0) {
    return { error: 'You are already in this room' };
  }

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) {
    return { error: 'User not found' };
  }

  return users.splice(idx, 1)[0];
};

const getUser = (id) => {
  return users.find((u) => u.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((u) => u.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
