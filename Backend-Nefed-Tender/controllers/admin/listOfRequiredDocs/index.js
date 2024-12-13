const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const listOfRequiredDocs = asyncErrorHandler(async (req, res) => {
  let { tag_id } = req.params;

  if (!tag_id) {
    const { user_id, login_as } = req.user;
    const tableName = {
      admin: 'admin',
      buyer: 'buyer',
      seller: 'seller',
      manager: 'manager'
    }[login_as];

    if (!tableName) {
      return res.status(400).json({ msg: 'Invalid user type', success: false });
    }

    const tagQuery = `SELECT tag_id FROM ${tableName} WHERE user_id = $1`;
    const { rows: tagRows } = await db.query(tagQuery, [user_id]);

    if (tagRows.length === 0) {
      return res.status(404).json({ msg: 'Tag ID not found for the user', success: false });
    }

    tag_id = tagRows[0].tag_id;
  }

  const query = `
    SELECT *
    FROM required_documents
    WHERE tag_id = $1
  `;

  try {
    const { rows } = await db.query(query, [tag_id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'No required documents found for this tag', success: false });
    }

    return res.status(200).json({ requiredDocuments: rows, msg: 'Required documents fetched successfully', success: true });
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ msg: 'Internal server error', success: false });
  }
});

module.exports = listOfRequiredDocs;
