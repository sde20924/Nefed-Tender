import db from "../../config/config2.js"; // MySQL database connection
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Error handling middleware

/**
 * Controller to fetch the buyer list.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getBuyerList = asyncErrorHandler(async (req, res) => {
  try {
    // Query to fetch the buyer list
    const query = `
      SELECT 
        user_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_on 
      FROM buyer
    `;

    // Execute the query and retrieve results
    const [rows] = await db.execute(query);

    // Respond with the fetched buyer data
    res.status(200).json({
      success: true,
      buyerData: rows,
    });
  } catch (error) {
    console.error("Error fetching buyer list:", error.message);

    // Respond with error details
    res.status(500).json({
      success: false,
      msg: "Failed to fetch buyer list",
      error: error.message,
    });
  }
});
