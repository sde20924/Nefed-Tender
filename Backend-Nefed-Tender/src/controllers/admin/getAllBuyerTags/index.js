import db from '../../../config/config.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllBuyerTags = asyncErrorHandler(async (req, res) => {
    const query = `
        SELECT id, name
        FROM tags
        WHERE for_table = 'buyer'`;

    const { rows } = await db.query(query);

    res.status(200).json({ buyerTags: rows, success: true });
});

export default getAllBuyerTags;
