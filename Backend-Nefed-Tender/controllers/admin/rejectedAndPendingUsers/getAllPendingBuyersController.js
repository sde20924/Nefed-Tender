const db = require("../../../config/config");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");

const getAllPendingBuyersController = asyncErrorHandler(async(req, res) => {
    const buyerQuery = `
      SELECT *, 'buyer' AS type FROM buyer WHERE status IN ('pending', 'not_verified') AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(buyerQuery);
    const pendingBuyers = buyers
    
    return res.status(200).json({
      data: pendingBuyers,
      msg: "Pending Buyer fetched successfully",
      success: true
    })
})

module.exports = getAllPendingBuyersController