const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const getUserInfo = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.params;

  const tableName = {
    admin: 'admin',
    buyer: 'buyer',
    seller: 'seller',
    manager: 'manager'
  }[login_as];

  if (!tableName) {
    return res.status(400).send({ msg: 'Invalid user type', sts: "FAILED", success: false });
  }

  const userQuery = `SELECT u.*, t.name AS tag_name
    FROM ${tableName} u
    LEFT JOIN tags t ON u.tag_id = t.id
    WHERE u.user_id = $1`;
  const { rows } = await db.query(userQuery, [user_id]);

  if (rows.length === 0) {
    return res.status(404).send({ msg: 'User not found', success: false });
  }

  const userDetails = rows[0];
  const { tag_id } = userDetails;

  let managers = [];
  if (['buyer', 'seller', 'admin'].includes(login_as)) {
    const managerQuery = `SELECT * FROM manager WHERE created_by = $1 AND is_blocked = false ORDER BY created_on DESC`;
    const managerResult = await db.query(managerQuery, [user_id]);
    managers = managerResult.rows;
  }

  // Fetch user documents based on tag_id
  const documentQuery = `SELECT doc_name, doc_url FROM user_documents WHERE user_id = $1 AND tag_id = $2`;
  const documentResult = await db.query(documentQuery, [user_id, tag_id]);
  const userDocuments = documentResult.rows;

  return res.status(200).send({
    userDetails: {...userDetails, userDocuments},
    managers,
    msg: 'User details fetched successfully',
    success: true
  });
});

module.exports = getUserInfo;
