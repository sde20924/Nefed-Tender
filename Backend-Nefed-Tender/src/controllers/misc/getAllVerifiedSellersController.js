import db from "../../config/config.js";
import asyncErrorHandler from "../../utils/asyncErrorHandler.js";

const getAllVerifiedSellersController = asyncErrorHandler(async (req, res) => {
    const query = `SELECT * FROM seller WHERE status = 'approved' AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: sellers } = await db.query(query);
    console.log("data: ", sellers);
    const verifiedSellers = sellers;
    return res.status(200).send({
        data: verifiedSellers,
        msg: "Verified Sellers fetched successfully",
        success: true
    });
});

export default getAllVerifiedSellersController;
