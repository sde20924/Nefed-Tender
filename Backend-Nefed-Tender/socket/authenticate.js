const jwt = require("jsonwebtoken");
const { userVerifyApi } = require("../utils/external/api");
const axios = require("axios");
let connectedUsers = {};

const authSocketMiddleware = async (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers?.cookie;

  try {
    if (!token) {
      return false;
    }
    const tokenString = token?.split("=")[1];
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

const getConnectedUsers = () => connectedUsers;

module.exports = { authSocketMiddleware, getConnectedUsers };
