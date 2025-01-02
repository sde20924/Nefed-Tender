import db from '../../../config/config2.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getAllPendingSellersController = asyncErrorHandler(async (req, res) => {
    const sellerQuery = `SELECT *, 'seller' AS type FROM seller WHERE status IN ('pending', 'not_verified') AND is_blocked != true ORDER BY created_on DESC`;
    const { rows: sellers } = await db.query(sellerQuery);
    const pendingSellers = sellers;
    
    return res.status(200).json({
        data: pendingSellers,
        msg: "Pending Sellers fetched successfully",
        success: true
    });
});

export default getAllPendingSellersController;
