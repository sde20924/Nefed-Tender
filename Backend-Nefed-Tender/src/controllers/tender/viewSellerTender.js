// File: controllers/tender/getSellerTenders.js
import db from "../../config/config2.js"; // Import database connection
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Import error handler middleware

/**
 * Controller to fetch all tenders of a specific seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSellerTendersController = asyncErrorHandler(async (req, res) => {
  const sellerId = req.user?.user_id; // Extract seller ID from authenticated user

  try {
    // SQL query to fetch tenders for the specific seller, ordered by the latest creation date
    const query = `
      SELECT * 
      FROM manage_tender 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const [sellerTenders] = await db.execute(query, [sellerId]);

    // Check if any tenders are found
    if (!sellerTenders.length) {
      return res.status(404).json({
        msg: "No tenders found for the seller",
        success: false,
      });
    }

    // Success response with fetched tenders
    return res.status(200).json({
      data: sellerTenders,
      msg: "Seller tender data fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching seller tenders:", error.message);

    // Error response
    return res.status(500).json({
      msg: "Error fetching seller tenders",
      success: false,
      error: error.message,
    });
  }
});
