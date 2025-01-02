import db from "../../config/config2.js"; // MySQL database connection

/**
 * Controller to fetch all bids for a specific tender and identify the lowest bid.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderBids = async (req, res) => {
  try {
    const { tender_id } = req.params; // Get the tender ID from the request parameters

    // Ensure the tender_id is provided
    if (!tender_id) {
      return res.status(400).json({
        success: false,
        message: "Tender ID is required.",
      });
    }

    // Query to find all bids for the specified tender, ordered by bid_amount in ascending order
    const query = `
      SELECT 
        user_id, 
        bid_amount 
      FROM 
        tender_bid_room 
      WHERE 
        tender_id = ? 
      ORDER BY 
        bid_amount ASC;
    `;

    // Execute the query with the parameterized tender_id
    const [rows] = await db.execute(query, [tender_id]);

    // Check if there are results
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bids found for this tender.",
      });
    }

    // All bid data sorted in ascending order by bid amount
    const bids = rows;

    // The first row in the sorted result is the lowest bid
    const lowestBid = bids[0];

    // Send all bids and the lowest bid details
    return res.status(200).json({
      success: true,
      lowestBid,
      allBids: bids,
    });
  } catch (error) {
    console.error("Error fetching bids:", error.message);

    // Return a 500 status for server errors
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
