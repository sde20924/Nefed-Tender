const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");

const getAllVerifiedSellersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM seller WHERE status = 'approved' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(query);
    console.log("data: ", buyers);
    const verifiedBuyers = buyers;
    return res.status(200).send({
        data: verifiedBuyers,
        msg: "Verified Sellers fetched successfully",
        success: true
    });
});

module.exports = getAllVerifiedSellersController;
