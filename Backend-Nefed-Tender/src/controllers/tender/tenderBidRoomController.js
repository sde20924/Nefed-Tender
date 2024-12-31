const db = require('../../config/config'); // MySQL connection pool

// Controller to handle bid submission
const submitBid = async (req, res) => {
  try {
    const { tender_id, bid_amount, fob_amount, freight_amount } = req.body; // Extract required fields from request body
    const { user_id } = req.user; // Assuming req.user contains authenticated user details

    // Validate required fields
    if (!tender_id || !bid_amount) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Fetch auction details from manage_tender
    const tenderQuery = `
      SELECT auct_end_time, amt_of_ext, time_frame_ext, aut_auct_ext_bfr_end_time, no_of_aut_auct_ext_happened
      FROM manage_tender
      WHERE tender_id = ?
    `;
    const [tenderResult] = await db.execute(tenderQuery, [tender_id]);

    if (tenderResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Tender not found.' });
    }

    const { auct_end_time, amt_of_ext, time_frame_ext, aut_auct_ext_bfr_end_time, no_of_aut_auct_ext_happened } = tenderResult[0];

    // Ensure auction end time is valid
    if (!auct_end_time || isNaN(auct_end_time)) {
      return res.status(400).json({ success: false, message: 'Invalid auction end time.' });
    }

    const currentTime = Date.now(); // Current time in milliseconds

    // Convert extension time fields from minutes to milliseconds
    const amtOfExtMs = amt_of_ext * 60 * 1000;
    const timeFrameExtMs = time_frame_ext * 60 * 1000;
    const auctEndTimeMs = auct_end_time * 1000;

    // Calculate remaining time
    const remainingTimeMs = auctEndTimeMs - currentTime;

    // Log relevant details for debugging
    console.log(`Current time: ${new Date(currentTime).toISOString()}`);
    console.log(`Auction end time (before update): ${new Date(auctEndTimeMs).toISOString()}`);
    console.log(`Remaining time in milliseconds: ${remainingTimeMs}`);

    // Handle auction extension logic
    if (no_of_aut_auct_ext_happened >= aut_auct_ext_bfr_end_time) {
      console.log('Max auction extensions reached, no further extensions allowed.');
    } else if (remainingTimeMs > 0 && remainingTimeMs <= amtOfExtMs) {
      // Extend the auction end time
      const newEndTime = auctEndTimeMs + timeFrameExtMs;

      const updateEndTimeQuery = `
        UPDATE manage_tender
        SET auct_end_time = ?, no_of_aut_auct_ext_happened = no_of_aut_auct_ext_happened + 1
        WHERE tender_id = ?
      `;
      await db.execute(updateEndTimeQuery, [newEndTime / 1000, tender_id]); // Store back in seconds

      console.log(`Auction end time (after update): ${new Date(newEndTime).toISOString()}`);
    } else {
      console.log('Bid placed outside the extension window.');
    }

    // Insert the bid into tender_bid_room
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
        bid_id: bidResult.insertId, // MySQL returns the inserted ID
        tender_id,
        user_id,
        bid_amount,
        fob_amount,
        freight_amount,
      },
      auctionExtended:
        remainingTimeMs > 0 && remainingTimeMs <= amtOfExtMs && no_of_aut_auct_ext_happened < aut_auct_ext_bfr_end_time,
    });
  } catch (error) {
    console.error('Error placing bid:', error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = { submitBid };
