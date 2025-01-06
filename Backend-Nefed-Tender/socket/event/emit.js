const { getConnectedUsers } = require("../authenticate");
const { getIO } = require("../connection");

const emitEvent = (eventName, data, userType, ids, user_id = "") => {
  const io = getIO();
  if (io) {
    const connectedUsers = getConnectedUsers();

    if (!connectedUsers || Object.keys(connectedUsers).length === 0) {
      return;
    }
    // if (!userType) {
    //   io.emit(eventName, data);
    // }
    if (userType && ids) {
      Object.keys(connectedUsers).forEach((users) => {
        const id = connectedUsers[users].socketId;
        if (
          connectedUsers[users].userType == userType &&
          connectedUsers[users].id == ids
        ) {
          io.to(id).emit(eventName, data);
        }
      });
    } else {
      Object.keys(connectedUsers).forEach((users) => {
        const id = connectedUsers[users].socketId;
        if (
          connectedUsers[users].userType === userType &&
          connectedUsers[users].id != user_id
        ) {
          io.to(id).emit(eventName, data);
        }
      });
    }
  } else {
    console.error("Socket.IO not initialized");
  }
};

module.exports = { emitEvent };
