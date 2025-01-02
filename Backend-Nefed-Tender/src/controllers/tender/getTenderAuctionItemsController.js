import db from '../../config/config2.js'; // Database configuration
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Async error handler middleware

/**
 * Controller to fetch auction items for a specific tender.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderAuctionItemsController = asyncErrorHandler(async (req, res) => {
  const { tender_id } = req.params; // Extract tender_id from request parameters

  // Validation to ensure tender_id is provided
  if (!tender_id) {
    return res.status(400).json({
      msg: "tender_id is required",
      success: false,
    });
  }

  try {
    // Query to fetch all auction items related to the tender_id
    const query = `
      SELECT * 
      FROM tender_auct_items 
      WHERE tender_id LIKE ?
    `;

    // Execute the query, allowing for partial matches of the tender_id
    const [rows] = await db.execute(query, [`%${tender_id.replace("tender_", "")}%`]);

    // If no auction items found, send a 404 response
    if (rows.length === 0) {
      return res.status(404).json({
        msg: "No auction items found for the provided tender_id",
        success: false,
      });
    }

    // Return the list of auction items
    return res.status(200).json({
      msg: "Auction items fetched successfully",
      success: true,
      auction_items: rows,
    });
  } catch (error) {
    console.error("Error fetching auction items:", error.message);

    // Respond with a 500 status for server errors
    return res.status(500).json({
      msg: "Error fetching auction items",
      success: false,
      error: error.message,
    });
  }
});
