const db = require("../../../config/config");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");

const getAllPendingSellersController = asyncErrorHandler(async(req, res) => {
    const sellerQuery = `SELECT *, 'seller' AS type FROM seller WHERE status IN ('pending', 'not_verified') AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: sellers } = await db.query(sellerQuery);
    const pendingSellers = sellers
    
    return res.status(200).json({
        data: pendingSellers,
        msg: "Pending Sellers fetched successfully",
        success: true
    })
})

module.exports = getAllPendingSellersController