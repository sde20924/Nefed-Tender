const axios = require("axios");
const { userVerifyApi } = require("../utils/external/api");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const verifyUser = asyncErrorHandler(async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }
  try {
    const response = await axios.get(`${userVerifyApi}xqwysr-taqw`, {
      headers: {
        Authorization: token,
      },
    });

    if (response.data.success) {
      const userData = response.data.verifiedData;
      console.log(
        `User "${userData.email}" logged in as "${userData.login_as}" with user_id "${userData.user_id}"`
      );

      req.user = {
        ...userData,
        token,
        isAdmin: userData.login_as == "admin" ? true : false,
      };

      next();
    } else {
      res.status(401).json({ msg: "User verification failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(error.response.data);
  }
});

module.exports = verifyUser;