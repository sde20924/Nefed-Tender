const db = require("../../config/config");

// Controller to get all bids for a specific tender and identify the lowest bid
const getTenderBids = async (req, res) => {
  try {
    const { tender_id } = req.params; // Get the tender ID from the request parameters

    // Ensure the tender_id is provided
    if (!tender_id) {
      return res.status(400).json({ success: false, message: 'Tender ID is required.' });
    }

    // Query to find all bids for the specified tender, ordered by bid_amount in ascending order
    const query = `
      SELECT user_id, bid_amount
      FROM tender_bid_room
      WHERE tender_id = $1
      ORDER BY bid_amount ASC;
    `;

    const values = [tender_id];

    const result = await db.query(query, values);

    // Check if there are results
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No bids found for this tender.' });
    }

    // All bid data sorted in ascending order by bid amount
    const bids = result.rows;

    // The first row in the sorted result is the lowest bid
    const lowestBid = bids[0];

    // Send all bids and the lowest bid details
    res.status(200).json({ success: true, lowestBid, allBids: bids });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = { getTenderBids };
