const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const updateRatingAndStatus = asyncErrorHandler(async (req, res) => {
  const { rating, type, user_id, status, remarks } = req.body;

  // Validate input
  if (typeof rating !== 'number' || !['buyer', 'seller'].includes(type) || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid input data', success: false });
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

  // Update rating_id and status in the respective table
  const updateQuery = `
    UPDATE ${tableName}
    SET rating_id = $1, status = $2, remarks_on_review=$3
    WHERE ${idField} = $4
  `;
  const result = await db.query(updateQuery, [rating, status, remarks, user_id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ msg: 'No records updated', success: false });
  }

  return res.status(200).json({ msg: `${type} rating and status updated successfully`, success: true });
});

module.exports = updateRatingAndStatus;
