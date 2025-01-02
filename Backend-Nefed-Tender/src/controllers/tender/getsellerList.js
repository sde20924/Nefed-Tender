import db from "../../config/config2.js"; // MySQL database connection
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Error handler middleware

/**
 * Controller to fetch the seller list.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getSellerList = asyncErrorHandler(async (req, res) => {
  try {
    // SQL query to fetch seller data
    const query = `
      SELECT 
        seller_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_on
      FROM 
        seller
    `;

    // Execute the query
    const [rows] = await db.execute(query);

    // Respond with the result
    res.status(200).json({
      success: true,
      sellerData: rows,
    });
  } catch (error) {
    console.error("Error fetching seller list:", error.message);

    // Respond with an error
    res.status(500).json({
      success: false,
      msg: "Failed to fetch seller list",
      error: error.message,
    });
  }
});
