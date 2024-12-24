const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const createTag = asyncErrorHandler(async (req, res) => {
    const { name, description, for_table } = req.body;

    // Validate for_table parameter
    if (!['buyer', 'seller'].includes(for_table)) {
        return res.status(400).json({ msg: 'Invalid table type', success: false });
    }

    // Check if tag with the same name already exists for the given for_table
    const checkQuery = 'SELECT * FROM tags WHERE name = $1 AND for_table = $2';
    const { rows: existingTags } = await db.query(checkQuery, [name, for_table]);

    if (existingTags.length > 0) {
        return res.status(400).json({ msg: `Tag '${name}' already exists for '${for_table}'`, success: false });
    }

    // Insert the tag if it doesn't already exist
    const insertQuery = 'INSERT INTO tags (name, description, for_table) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(insertQuery, [name, description, for_table]);

    res.status(201).json({ tag: rows[0], msg: 'Tag created successfully', success: true });
});

module.exports = createTag;
