const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const uploadDocController = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.user;
  const uploadedFiles = req.uploadedFiles;

  // Validate login_as
  if (!['buyer', 'seller', 'manager'].includes(login_as)) {
    return res.status(400).send({ msg: 'Invalid user type', success: false });
  }

  // Insert or update document URLs in user_documents table
  const insertPromises = Object.entries(uploadedFiles).map(async ([docName, docUrl]) => {
    const tagQuery = `
      SELECT tag_id FROM ${login_as} WHERE user_id = $1
    `;
    const { rows } = await db.query(tagQuery, [user_id]);

    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Tag not found for this user', success: false });
    }

    const tag_id = rows[0].tag_id;

    // Check if the document already exists
    const checkDocQuery = `
      SELECT * FROM user_documents WHERE user_id = $1 AND tag_id = $2 AND doc_name = $3
    `;
    const { rows: existingDocRows } = await db.query(checkDocQuery, [user_id, tag_id, docName]);

    if (existingDocRows.length > 0) {
      // Update the existing document
      const updateDocQuery = `
        UPDATE user_documents
        SET doc_url = $4
        WHERE user_id = $1 AND tag_id = $2 AND doc_name = $3
      `;
      await db.query(updateDocQuery, [user_id, tag_id, docName, docUrl]);
    } else {
      // Insert a new document
      const insertDocQuery = `
        INSERT INTO user_documents (user_id, tag_id, doc_name, doc_url)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(insertDocQuery, [user_id, tag_id, docName, docUrl]);
    }
  });

  await Promise.all(insertPromises);

  // Update the status to "pending" in the relevant user table
  const updateStatusQuery = `
    UPDATE ${login_as}
    SET status = 'pending'
    WHERE user_id = $1
  `;
  await db.query(updateStatusQuery, [user_id]);

  return res.status(200).send({ files: uploadedFiles, msg: 'User docs uploaded and URLs saved to DB successfully, status updated to pending', success: true });
});

module.exports = uploadDocController;
