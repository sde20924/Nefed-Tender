import db from '../../../config/config.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllPendingBuyersController = asyncErrorHandler(async (req, res) => {
    const buyerQuery = `
      SELECT *, 'buyer' AS type FROM buyer WHERE status IN ('pending', 'not_verified') AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(buyerQuery);
    const pendingBuyers = buyers;
    
    return res.status(200).json({
      data: pendingBuyers,
      msg: "Pending Buyer fetched successfully",
      success: true
    });
});

export default getAllPendingBuyersController;
