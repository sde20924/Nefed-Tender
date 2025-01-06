const { getConnectedUsers } = require("../authenticate");
const { getIO } = require("../connection");

const emitEvent = (eventName, data, userType, ids) => {
  const io = getIO();
  if (io) {
    const connectedUsers = getConnectedUsers();
    // if (!userType) {
    //   io.emit(eventName, data);
    // }
    if (userType && ids) {
      Object.keys(connectedUsers).forEach((users) => {
        const id = connectedUsers[users].socketId;
        if (
          connectedUsers[users].userType === userType &&
          connectedUsers[users].id === ids
        ) {
          io.to(id).emit(eventName, data);
        }
      });
    } else {
      Object.keys(connectedUsers).forEach((users) => {
        const id = connectedUsers[users].socketId;
        if (connectedUsers[users].userType === userType) {
          io.to(id).emit(eventName, data);
        }
      });
    }
  } else {
    console.error("Socket.IO not initialized");
  }
};

module.exports = { emitEvent };
