import { getConnectedUsers } from "../authenticate.js";
import { getIO } from "../connection.js";

export const emitEvent = (eventName, data, userType, ids, user_id = "") => {
  const io = getIO();
  if (io) {
    const connectedUsers = getConnectedUsers();

    if (!connectedUsers || Object.keys(connectedUsers).length === 0) {
      return;
    }

    if (userType && ids) {
      // Emit to specific users based on userType and ids
      Object.keys(connectedUsers).forEach((userKey) => {
        const user = connectedUsers[userKey];
        if (user.userType === userType && user.id == ids) {
          io.to(user.socketId).emit(eventName, data);
        }
      });
    } else {
      // Emit to all users of a certain userType, excluding a specific user_id
      Object.keys(connectedUsers).forEach((userKey) => {
        const user = connectedUsers[userKey];
        if (user.userType === userType && user.id != user_id) {
          io.to(user.socketId).emit(eventName, data);
        }
      });
    }
  } else {
    console.error("Socket.IO not initialized");
  }
};
