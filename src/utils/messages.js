const buildMessage = (text, username) => ({
  text,
  username,
  timestamp: new Date().getTime(),
});

module.exports = { buildMessage };
