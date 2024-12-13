const db = require('../../../config/config');
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");

const createRequiredDocument = asyncErrorHandler(async (req, res) => {
    const { tag_id, name, doc_ext, max_size } = req.body;

    // Check if a document with the same name already exists for the given tag_id
    const checkQuery = 'SELECT * FROM required_documents WHERE tag_id = $1 AND name = $2';
    const checkResult = await db.query(checkQuery, [tag_id, name]);

    if (checkResult.rows.length > 0) {
        return res.status(400).json({ msg: 'A document with the same name already exists for this tag', success: false });
    }

    // Insert the new required document if no duplicates are found
    const insertQuery = 'INSERT INTO required_documents (tag_id, name, doc_ext, max_size) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await db.query(insertQuery, [tag_id, name, doc_ext, max_size]);

    res.status(201).json({ document: rows[0], msg: 'Document requirement created successfully', success: true });
});

module.exports = createRequiredDocument;
