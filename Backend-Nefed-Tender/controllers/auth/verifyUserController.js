const jwt = require('jsonwebtoken');
const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const verifyUserController = asyncErrorHandler (async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ msg: 'No token provided', success: false });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

    // Query the database to check the user's role
    const query = `
      SELECT user_id, registered_as, email
      FROM authentication
      WHERE user_id = $1
    `;
    const { rows } = await db.query(query, [decoded.user_id]);

    if (rows.length === 0) {
      return res.status(403).send({ msg: 'Access denied. User not found.', success: false });
    }

    const user = rows[0];

    if (user.registered_as !== decoded.login_as || user.email !== decoded.email) {
      return res.status(403).send({ msg: 'Access denied. Not authorized.', success: false });
    }
    
    console.log(`${user.email} logged in as: ${user.registered_as}`);
    return res.status(200).send({ msg: 'User verified successfully', success: true, verifiedData: decoded });
  } catch (error) {
    console.error('Error in verifyUser middleware:', error);
    return res.status(500).send({ msg: 'Failed to authenticate token', success: false });
  }
});

module.exports = verifyUserController;
