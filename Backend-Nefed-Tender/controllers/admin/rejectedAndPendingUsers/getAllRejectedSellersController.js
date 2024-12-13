const db = require("../../../config/config");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");

const getAllRejectedSellersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM seller WHERE status = 'rejected' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(query);
    console.log("data: ", buyers);
    const rejectedSellers = buyers;
    return res.status(200).json({
        data: rejectedSellers,
        msg: "Rejected Sellers fetched successfully",
        success: true
    });
});

module.exports = getAllRejectedSellersController;
