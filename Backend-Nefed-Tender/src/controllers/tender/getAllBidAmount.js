const db = require('../../config/config'); // Import your database configuration

const getTenderBidsByTenderId = async (req, res) => {
  const { tender_id } = req.params; // Extract tenderId from the request parameters

  try {
    // Debug: Check if tenderId exists in tender_bid_room
    const checkTenderResult = await db.query(
      `SELECT * FROM tender_bid_room WHERE tender_id = $1`,
      [tender_id]
    );

    if (checkTenderResult.rows.length === 0) {
      console.log(`No records found in tender_bid_room for tender_id: ${tender_id}`);
      return res.status(404).send({ msg: 'No bids found for the selected tender', success: false });
    }

    // Step 1: Get all users and their bid amounts who placed bids on the specified tender
    const bidsResult = await db.query(
      `SELECT tbr.user_id, b.first_name, b.last_name, b.company_name, tbr.bid_amount
       FROM tender_bid_room tbr
       JOIN buyer b ON tbr.user_id = b.user_id
       WHERE tbr.tender_id = $1
       ORDER BY tbr.user_id, tbr.bid_amount DESC`,
      [tender_id]
    );

    // If no bids found, return 404
    if (bidsResult.rows.length === 0) {
      return res.status(404).send({ msg: 'No bids found for the selected tender', success: false });
    }

    // Step 2: Organize bids by user
    const bidsMap = {};
    bidsResult.rows.forEach((row) => {
      const { user_id, first_name, last_name, company_name, bid_amount } = row;

      if (!bidsMap[user_id]) {
        // Initialize a new entry for a user if not already present
        bidsMap[user_id] = {
          user_id,
          first_name,
          last_name,
          company_name,
          bid_amounts: [],
        };
      }

      // Add the bid amount to the user's bid_amounts array
      bidsMap[user_id].bid_amounts.push(bid_amount);
    });

    // Convert bidsMap to an array
    const allBids = Object.values(bidsMap);

    res.status(200).send({
      msg: 'Bids retrieved successfully',
      success: true,
      allBids,
    });
  } catch (error) {
    console.error('Error retrieving bids:', error.message);
    res.status(500).send({ msg: 'Error retrieving bids', success: false });
  }
};

module.exports = {
  getTenderBidsByTenderId,
};
