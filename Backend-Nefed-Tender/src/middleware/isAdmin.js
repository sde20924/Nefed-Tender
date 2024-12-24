const jwt = require('jsonwebtoken');
const db = require('../config/config');

const isAdmin = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ msg: 'No token provided', success: false });
  }
  try {
    // console.log('token', token);
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;

    const { user_id, login_as } = req.user;

    // Query the database to check the user's role in the authentication table
    const { rows } = await db.query('SELECT user_id, registered_as, email FROM "authentication" WHERE user_id = $1 AND registered_as = $2', [user_id, 'admin']);

    if (rows.length === 0) {
      return res.status(403).send({ msg: 'Access denied. Only Admin can access.', success: false });
    }
    const user = rows[0];
    console.log(`${user.email} logged in as: ${user.registered_as}`);
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).send({ msg: 'Failed to authenticate token', success: false });
  }
};

module.exports = isAdmin;
