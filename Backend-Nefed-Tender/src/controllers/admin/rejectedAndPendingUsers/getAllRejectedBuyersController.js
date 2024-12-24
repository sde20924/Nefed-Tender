const db = require("../../../config/config");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");

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

module.exports = getAllRejectedBuyersController;
