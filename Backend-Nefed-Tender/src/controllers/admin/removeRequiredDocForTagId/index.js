const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const removeRequiredDocForTagId = asyncErrorHandler(async (req, res) => {
  const { tag_id, doc_id } = req.params;

  // Delete query to remove the required document
  const deleteQuery = `
    DELETE FROM required_documents
    WHERE id = $1 AND tag_id = $2
    RETURNING *;
  `;
  
  const { rows } = await db.query(deleteQuery, [doc_id, tag_id]);

  if (rows.length === 0) {
    return res.status(404).json({ msg: 'Required document not found', success: false });
  }

  res.status(200).json({ msg: 'Required document removed successfully', success: true, document: rows[0] });
});


module.exports = removeRequiredDocForTagId;
