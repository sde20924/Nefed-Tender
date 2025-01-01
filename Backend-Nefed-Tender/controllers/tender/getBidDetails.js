const db = require("../../config/config");

const getBidDetails = async (req, res) => {
  const user_id = req.user.user_id; // User ID from authentication middleware
  const { tender_id } = req.query; // Tender ID from query parameters

  if (!tender_id) {
    return res.status(400).json({
      msg: "Required field 'tender_id' is missing.",
      success: false,
    });
  }

  try {
    // Fetch bid details from tender_bid_room
    const [bidDetails] = await db.query(
      `SELECT bid_id, tender_id, user_id, bid_amount, status, created_at 
       FROM tender_bid_room 
       WHERE tender_id = ? AND user_id = ?`,
      [tender_id, user_id]
    );

    if (!bidDetails.length) {
      return res.status(404).json({
        msg: "No bid details found for the given tender ID and user ID.",
        success: false,
      });
    }

    // Fetch row data from buyer_header_row_data
    const [rowData] = await db.query(
      `SELECT header_id, row_data, subtender_id, buyer_id, \`order\`, row_number 
       FROM buyer_header_row_data 
       WHERE subtender_id IN (
         SELECT id FROM sub_tenders WHERE tender_id = ?
       ) AND buyer_id = ?`,
      [tender_id, user_id]
    );

    res.status(200).json({
      msg: "Bid details and row data fetched successfully.",
      success: true,
      data: {
        bidDetails: bidDetails[0], // Return the first bid detail (assuming one bid per user per tender)
        rowData,
      },
    });
  } catch (error) {
    console.error("Error fetching bid details and row data:", error.message);

    res.status(500).json({
      msg: "Error fetching bid details and row data.",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getBidDetails };
