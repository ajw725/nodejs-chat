const buildMessage = (text) => ({
  text,
  timestamp: new Date().getTime(),
});

module.exports = { buildMessage };
