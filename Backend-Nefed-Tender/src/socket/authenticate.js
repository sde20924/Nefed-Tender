import { userVerifyApi } from "../utils/external/api.js";
import axios from "axios";

const connectedUsers = {};

/**
 * Socket.IO middleware for authenticating users.
 *
 * @param {Object} socket - The Socket.IO socket instance.
 * @param {Function} next - The callback to pass control to the next middleware.
 */
export const authSocketMiddleware = async (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers?.cookie;

  try {
    if (!token) {
      return false;
    }

    // Assuming the token is in the format "key=tokenString"
    const tokenParts = token.split("=");
    const tokenString = tokenParts.length > 1 ? tokenParts[1] : tokenParts[0];

    const response = await axios.get(`${userVerifyApi}xqwysr-taqw`, {
      headers: {
        Authorization: tokenString,
      },
    });

    if (response.data.success) {
      const userData = response.data.verifiedData;
      connectedUsers[userData.user_id] = {
        socketId: socket.id,
        email: userData.email,
        userType: userData.login_as,
        id: userData.user_id,
      };
      // Attach user data to socket for later use
      // socket.user = connectedUsers[userData.user_id];
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Retrieves the list of currently connected users.
 *
 * @returns {Object} - An object containing connected user details.
 */
export const getConnectedUsers = () => connectedUsers;
