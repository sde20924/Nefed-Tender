import db from "../../config/config.js";
import asyncErrorHandler from "../../utils/asyncErrorHandler.js";

const getAllVerifiedBuyersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM buyer WHERE status = 'approved' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: buyers } = await db.query(query);
    console.log("data: ", buyers);
    const verifiedBuyers = buyers;
    return res.status(200).json({
        data: verifiedBuyers,
        msg: "Verified Buyers fetched successfully",
        success: true
    });
});

export default getAllVerifiedBuyersController;
