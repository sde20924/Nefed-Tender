import { Server as SocketIO } from "socket.io";
import { authSocketMiddleware, getConnectedUsers } from "./authenticate.js";

let io;

export const initializeSocket = (server) => {
  io = new SocketIO(server, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:8001"], 
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["websocket"], 
  });

  console.log("Socket.IO initialized");

  io.on("connection", async (socket) => {
    try {
      const isAuthenticated = await authSocketMiddleware(socket);

      if (isAuthenticated) {
        console.log("User connected");
        const connectedUsers = getConnectedUsers();
        console.log(connectedUsers);
        socket.send("Socket.IO connection success");
      } else {
        socket.send("Socket.IO connection failed");
        socket.disconnect();
      }

      socket.on("disconnect", () => {
        const connectedUsers = getConnectedUsers();
        const disconnectedUser = Object.entries(connectedUsers).find(
          ([, user]) => user.socketId === socket.id
        );

        if (disconnectedUser) {
          const [userId] = disconnectedUser;
          delete connectedUsers[userId];
          console.log(`User ${userId} disconnected`);
        }
      });
    } catch (error) {
      console.error("Error during Socket.IO connection:", error.message);
      socket.disconnect();
    }
  });

  return io;
};

export const getIO = () => io;
