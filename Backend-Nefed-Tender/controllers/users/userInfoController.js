const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const getUserInfoController = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.user;

  const tableName = {
    admin: 'admin',
    buyer: 'buyer',
    seller: 'seller',
    manager: 'manager'
  }[login_as];

  if (!tableName) {
    return res.status(400).send({ msg: 'Invalid user type', sts: "FAILED", success: false });
  }

  let userQuery = `
    SELECT u.*, t.name AS tag_name
    FROM ${tableName} u
    LEFT JOIN tags t ON u.tag_id = t.id
    WHERE u.user_id = $1
  `;

  const { rows } = await db.query(userQuery, [user_id]);

  if (rows.length === 0) {
    return res.status(404).send({ msg: 'User not found', success: false });
  }

  const userDetails = rows[0];
  return res.status(200).send({ userDetails, msg: 'User details fetched successfully', success: true });
});

module.exports = getUserInfoController;
