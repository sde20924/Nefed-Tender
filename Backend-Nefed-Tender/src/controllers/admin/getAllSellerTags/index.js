import db from '../../../config/config2.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllSellerTags = asyncErrorHandler(async (req, res) => {
    const query = `
        SELECT id, name
        FROM tags
        WHERE for_table = 'seller'`;

    const { rows } = await db.query(query);

    res.status(200).json({ sellerTags: rows, success: true });
});

export default getAllSellerTags;
