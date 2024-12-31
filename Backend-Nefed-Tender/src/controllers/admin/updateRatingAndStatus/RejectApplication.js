const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const rejectApplication= asyncErrorHandler(async (req, res) => {
  const { type, user_id } = req.body;

  // Validate input
  if (!['buyer', 'seller'].includes(type)) {
    return res.status(400).json({ msg: 'Invalid type specified', success: false });
  }

  let tableName, idField;

  // Determine table and id field based on type
  switch (type) {
    case 'buyer':
      tableName = 'buyer';
      idField = 'user_id';
      break;
    case 'seller':
      tableName = 'seller';
      idField = 'user_id';
      break;
    default:
      return res.status(400).json({ msg: 'Invalid type specified', success: false });
  }

  // Check if the user exists
  const checkUserQuery = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
  const userResult = await db.query(checkUserQuery, [user_id]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({ msg: 'User not found', success: false });
  }

  // Update status to 'rejected' in the respective table
  const updateQuery = `
    UPDATE ${tableName}
    SET status = $1
    WHERE ${idField} = $2
  `;
  const result = await db.query(updateQuery, ['rejected', user_id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ msg: 'No records updated', success: false });
  }

  return res.status(200).json({ msg: `${type} application rejected successfully`, success: true });
});

module.exports = rejectApplication;
