const { getIO } = require("../connection");

const onEvent = (eventName, callback) => {
  const io = getIO();
  if (io) {
    io.on(eventName, callback);
  } else {
    console.error("Socket.IO not initialized");
  }
};

module.exports = { onEvent };
