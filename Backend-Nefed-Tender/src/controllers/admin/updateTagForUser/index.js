const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const updateTagForUser = asyncErrorHandler(async (req, res) => {
    const { tag_id, user_ids, type } = req.body;

    // Validate type parameter
    if (!['buyer', 'seller'].includes(type)) {
        return res.status(400).json({ msg: 'Invalid type parameter', success: false });
    }

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ msg: 'Please select at least one user. user_ids must not be an empty array', success: false });
    }

    const tableName = type === 'buyer' ? 'buyer' : 'seller';

    // Validate tag_id exists for the specified type
    const tagCheckQuery = 'SELECT * FROM tags WHERE id = $1 AND for_table = $2';
    const { rows: validTags } = await db.query(tagCheckQuery, [tag_id, type]);

    if (validTags.length === 0) {
        return res.status(404).json({ msg: `Invalid tag_id for ${type}`, success: false });
    }

    // Check if all provided user_ids exist in the specified table
    const userCheckQuery = `
        SELECT user_id
        FROM ${tableName}
        WHERE user_id = ANY($1::int[])`;

    const { rows: existingUsers } = await db.query(userCheckQuery, [user_ids]);

    if (existingUsers.length !== user_ids.length) {
        return res.status(404).json({ msg: `One or more user_ids do not exist in the ${type} table`, success: false });
    }

    // Proceed with the update if all user_ids exist
    const updateQuery = `
        UPDATE ${tableName}
        SET tag_id = $1, status = 'not_verified'
        WHERE user_id = ANY($2::int[])
        RETURNING *`;

    const { rows: updatedUsers } = await db.query(updateQuery, [tag_id, user_ids]);

    res.status(200).json({ updatedUsers, msg: `${type} tags updated successfully`, success: true });
});

module.exports = updateTagForUser;
