const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const getAllSellerTags = asyncErrorHandler(async (req, res) => {
    const query = `
        SELECT id, name
        FROM tags
        WHERE for_table = 'seller'`;

    const { rows } = await db.query(query);

    res.status(200).json({ sellerTags: rows, success: true });
});

module.exports = getAllSellerTags;
