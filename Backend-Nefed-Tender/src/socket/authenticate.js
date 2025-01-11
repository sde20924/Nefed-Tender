import { userVerifyApi } from "../utils/external/api.js";
import axios from "axios";

const connectedUsers = {};

export const authSocketMiddleware = async (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers?.cookie;

  try {
    if (!token) {
      return false;
    }

  
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
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};


export const getConnectedUsers = () => connectedUsers;
