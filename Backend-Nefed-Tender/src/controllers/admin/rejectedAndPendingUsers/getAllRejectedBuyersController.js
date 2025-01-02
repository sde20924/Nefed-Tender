import db from '../../../config/config2.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllRejectedBuyersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM buyer WHERE status = 'rejected' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(query);
    const rejectedBuyers = buyers;
    return res.status(200).json({
        data: rejectedBuyers,
        msg: "Rejected buyers fetched successfully",
        success: true
    });
});

export default getAllRejectedBuyersController;
