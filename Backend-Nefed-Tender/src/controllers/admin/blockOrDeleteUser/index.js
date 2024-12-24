const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const blockOrDeleteUser = asyncErrorHandler(async (req, res) => {
    const { user_id, type, operation } = req.body;

    let tableName, idField, updateField;

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
        case 'manager':
            tableName = 'manager';
            idField = 'user_id';
            break;
        default:
            return res.status(400).json({ msg: 'Invalid type specified', success: false });
    }

    // Prepare the update query based on operation
    let updateQuery, queryParams;

    switch (operation) {
        case 'delete':
            updateQuery = `DELETE FROM ${tableName} WHERE ${idField} = $1`;
            queryParams = [user_id];
            break;
        case 'block':
            updateQuery = `UPDATE ${tableName} SET is_blocked = true WHERE ${idField} = $1`;
            queryParams = [user_id];
            break;
        default:
            return res.status(400).json({ msg: 'Invalid operation specified', success: false });
    }

    // Execute the update or delete operation
    const result = await db.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
        return res.status(404).json({ msg: 'No records updated or deleted', success: false });
    }

    return res.status(200).json({ msg: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation successful for ${type}`, success: true });
});

module.exports = blockOrDeleteUser;
