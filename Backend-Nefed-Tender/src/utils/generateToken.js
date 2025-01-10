import jwt from "jsonwebtoken";

const generateUserToken = (user_id, type, email) => {
  return jwt.sign(
    { user_id: user_id, login_as: type, email: email },
    process.env.JWT_SECRET,
    { expiresIn: "72h" }
  );
};

export default generateUserToken;
