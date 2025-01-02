import db from "../../config/config2.js";

/**
 * Fetch all auction bids for a specific tender with user and tender details.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getAllAuctionBids = async (req, res) => {
  try {
    const { tender_id } = req.params;

    // Validate the tender_id
    if (!tender_id) {
      return res.status(400).json({
        success: false,
        message: "Tender ID is required.",
      });
    }

    // SQL query to fetch all bids with lowest bid details, user info, and tender details
    const query = `
      SELECT 
        tbr.bid_id,
        tbr.user_id,
        tbr.tender_id,
        tbr.bid_amount,
        tbr.fob_amount,
        tbr.freight_amount,
        tbr.round,
        tbr.qty_secured,
        tbr.status AS bid_status,
        tbr.created_at,
        b.first_name,
        b.last_name,
        b.company_name,
        b.phone_number,
        b.email,
        mt.dest_port,
        mt.auct_start_time,
        mt.auct_end_time,
        mt.qty,
        mt.emd_amt
      FROM 
        tender_bid_room tbr
      INNER JOIN (
        SELECT 
          user_id, 
          MIN(bid_amount) AS lowest_bid_amount
        FROM 
          tender_bid_room
        WHERE 
          tender_id = ?
        GROUP BY 
          user_id
      ) lb ON tbr.user_id = lb.user_id AND tbr.bid_amount = lb.lowest_bid_amount
      INNER JOIN 
        buyer b ON tbr.user_id = b.user_id
      INNER JOIN 
        manage_tender mt ON tbr.tender_id = mt.tender_id
      WHERE 
        tbr.tender_id = ?;
    `;
    const values = [tender_id, tender_id];

    // Execute the query
    const [result] = await db.query(query, values);

    // Handle no bids found
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bids found for this tender.",
      });
    }

    // Return the bids
    return res.status(200).json({
      success: true,
      allBids: result,
    });
  } catch (error) {
    console.error("Error fetching bids:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
