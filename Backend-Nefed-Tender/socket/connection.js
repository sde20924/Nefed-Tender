const socketIO = require("socket.io");
const { authSocketMiddleware, getConnectedUsers } = require("./authenticate");
const path = require("path");

let io;
// origin: ["http://localhost:3000"],
const initializeSocket = (server) => {
  io = socketIO(server, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:8001"],
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["websocket"],
  });

  console.log("socket initiated");

  io.on("connection", async (socket) => {
    const isAuthenticated = await authSocketMiddleware(socket);

    if (isAuthenticated) {
      console.log("connected");
      const connectedUsers = getConnectedUsers();
      console.log(connectedUsers);
      socket.send("Socket IO connection success");
    } else {
      socket.send("Socket IO connection failed");
      socket.disconnect();
    }

    socket.on("disconnect", () => {
      const connectedUsers = getConnectedUsers();
      const disconnectedUser = Object.entries(connectedUsers).find(
        ([userId, user]) => user.socketId === socket.id
      );

      if (disconnectedUser) {
        const [userId] = disconnectedUser;
        delete connectedUsers[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
};

module.exports = {
  initializeSocket,
  getIO: () => io,
};
