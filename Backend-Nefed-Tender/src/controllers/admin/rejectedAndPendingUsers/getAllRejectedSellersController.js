import db from '../../../config/config.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllRejectedSellersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM seller WHERE status = 'rejected' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: sellers } = await db.query(query);
    console.log("data: ", sellers);
    const rejectedSellers = sellers;

    return res.status(200).json({
        data: rejectedSellers,
        msg: "Rejected Sellers fetched successfully",
        success: true
    });
});

export default getAllRejectedSellersController;
