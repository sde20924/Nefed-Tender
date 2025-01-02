import db from '../../config/config2.js'; // Import your database configuration

/**
 * Fetch bids for a specific tender, organized by user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderBidsByTenderId = async (req, res) => {
  const { tender_id } = req.params; // Extract tender_id from request parameters

  try {
    // Step 1: Check if there are any bids for the specified tender
    const [checkTenderResult] = await db.query(
      `SELECT 1 FROM tender_bid_room WHERE tender_id = ? LIMIT 1`,
      [tender_id]
    );

    if (checkTenderResult.length === 0) {
      console.log(`No records found in tender_bid_room for tender_id: ${tender_id}`);
      return res.status(404).json({
        success: false,
        msg: 'No bids found for the selected tender',
      });
    }

    // Step 2: Fetch all bids for the specified tender, including user details
    const [bidsResult] = await db.query(
      `
      SELECT 
        tbr.user_id,
        b.first_name,
        b.last_name,
        b.company_name,
        tbr.bid_amount
      FROM 
        tender_bid_room tbr
      INNER JOIN 
        buyer b ON tbr.user_id = b.user_id
      WHERE 
        tbr.tender_id = ?
      ORDER BY 
        tbr.user_id, tbr.bid_amount DESC
      `,
      [tender_id]
    );

    // If no bids are found, return 404
    if (bidsResult.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No bids found for the selected tender',
      });
    }

    // Step 3: Organize bids by user
    const bidsMap = bidsResult.reduce((acc, row) => {
      const { user_id, first_name, last_name, company_name, bid_amount } = row;

      if (!acc[user_id]) {
        acc[user_id] = {
          user_id,
          first_name,
          last_name,
          company_name,
          bid_amounts: [],
        };
      }

      acc[user_id].bid_amounts.push(bid_amount);
      return acc;
    }, {});

    // Convert the bids map to an array for the response
    const allBids = Object.values(bidsMap);

    // Success response
    res.status(200).json({
      success: true,
      msg: 'Bids retrieved successfully',
      allBids,
    });
  } catch (error) {
    console.error('Error retrieving bids:', error.message);
    res.status(500).json({
      success: false,
      msg: 'Error retrieving bids',
    });
  }
};
