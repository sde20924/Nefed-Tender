import db from '../../config/config2.js';

/**
 * Controller to handle bid submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const submitBid = async (req, res) => {
  try {
    const { tender_id, bid_amount, fob_amount, freight_amount } = req.body; // Extract required fields
    const { user_id } = req.user; // Extract authenticated user ID

    // Validate required fields
    if (!tender_id || !bid_amount) {
      return res.status(400).json({ success: false, message: 'Tender ID and bid amount are required.' });
    }

    // Fetch auction details
    const tenderQuery = `
      SELECT auct_end_time, amt_of_ext, time_frame_ext, aut_auct_ext_bfr_end_time, no_of_aut_auct_ext_happened
      FROM manage_tender
      WHERE tender_id = ?
    `;
    const [tenderResult] = await db.execute(tenderQuery, [tender_id]);

    if (tenderResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Tender not found.' });
    }

    const {
      auct_end_time,
      amt_of_ext,
      time_frame_ext,
      aut_auct_ext_bfr_end_time,
      no_of_aut_auct_ext_happened,
    } = tenderResult[0];

    if (!auct_end_time || isNaN(auct_end_time)) {
      return res.status(400).json({ success: false, message: 'Invalid auction end time.' });
    }

    const currentTime = Date.now(); // Current time in milliseconds
    const auctEndTimeMs = auct_end_time * 1000; // Convert auction end time to milliseconds
    const remainingTimeMs = auctEndTimeMs - currentTime;

    console.log(`Current time: ${new Date(currentTime).toISOString()}`);
    console.log(`Auction end time: ${new Date(auctEndTimeMs).toISOString()}`);
    console.log(`Remaining time: ${remainingTimeMs} ms`);

    let auctionExtended = false;

    // Handle auction extension
    if (remainingTimeMs > 0 && remainingTimeMs <= amt_of_ext * 60 * 1000) {
      if (no_of_aut_auct_ext_happened < aut_auct_ext_bfr_end_time) {
        const newEndTime = auctEndTimeMs + time_frame_ext * 60 * 1000;

        const updateEndTimeQuery = `
          UPDATE manage_tender
          SET auct_end_time = ?, no_of_aut_auct_ext_happened = no_of_aut_auct_ext_happened + 1
          WHERE tender_id = ?
        `;
        await db.execute(updateEndTimeQuery, [Math.floor(newEndTime / 1000), tender_id]); // Update in seconds

        auctionExtended = true;
        console.log(`Auction extended. New end time: ${new Date(newEndTime).toISOString()}`);
      } else {
        console.log('Max auction extensions reached.');
      }
    } else {
      console.log('Bid placed outside the extension window.');
    }

    // Insert the bid
    const insertBidQuery = `
      INSERT INTO tender_bid_room (tender_id, user_id, bid_amount, fob_amount, freight_amount)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [bidResult] = await db.execute(insertBidQuery, [tender_id, user_id, bid_amount, fob_amount, freight_amount]);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Bid placed successfully.',
      data: {
        bid_id: bidResult.insertId,
        tender_id,
        user_id,
        bid_amount,
        fob_amount,
        freight_amount,
      },
      auctionExtended,
    });
  } catch (error) {
    console.error('Error placing bid:', error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
