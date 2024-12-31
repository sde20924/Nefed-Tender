const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const getAllBuyerTags = asyncErrorHandler(async (req, res) => {
    const query = `
        SELECT id, name
        FROM tags
        WHERE for_table = 'buyer'`;

    const { rows } = await db.query(query);

    res.status(200).json({ buyerTags: rows, success: true });
});

module.exports = getAllBuyerTags;
