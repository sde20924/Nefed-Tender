const db = require('../../config/config'); // PostgreSQL connection pool

// Controller to handle bid submission
const submitBid = async (req, res) => {
  try {
    const { tender_id, bid_amount ,fob_amount,freight_amount } = req.body; // Get tender_id and bid_amount from request body
    const { user_id } = req.user; // Assuming req.user contains authenticated user details

    // Ensure all required fields are provided
    if (!tender_id || !bid_amount) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Fetch auction details from manage_tender
    const tenderQuery = `
      SELECT auct_end_time, amt_of_ext, time_frame_ext, aut_auct_ext_bfr_end_time, no_of_aut_auct_ext_happened
      FROM manage_tender
      WHERE tender_id = $1;
    `;
    const tenderResult = await db.query(tenderQuery, [tender_id]);

    if (tenderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tender not found.' });
    }

    const { auct_end_time, amt_of_ext, time_frame_ext, aut_auct_ext_bfr_end_time, no_of_aut_auct_ext_happened } = tenderResult.rows[0];

    // Ensure auct_end_time is valid
    if (!auct_end_time || isNaN(auct_end_time)) {
      return res.status(400).json({ success: false, message: 'Invalid auction end time.' });
    }

    const currentTime = Date.now(); // Get current time in milliseconds

    // Convert amt_of_ext and time_frame_ext from minutes to milliseconds
    const amtOfExtMs = amt_of_ext * 60 * 1000; // amt_of_ext in milliseconds
    const timeFrameExtMs = time_frame_ext * 60 * 1000; // time_frame_ext in milliseconds

    // Convert auct_end_time from seconds to milliseconds
    const auctEndTimeMs = auct_end_time * 1000;

    // Calculate remaining time in milliseconds
    const remainingTimeMs = auctEndTimeMs - currentTime;

    // Log current time, auction end time, and remaining time
    console.log(`Current time: ${new Date(currentTime).toISOString()}`);
    console.log(`Auction end time (before update): ${new Date(auctEndTimeMs).toISOString()}`);
    console.log(`Remaining time in milliseconds: ${remainingTimeMs}`);

    // Check if the number of extensions has already reached the limit
    if (no_of_aut_auct_ext_happened >= aut_auct_ext_bfr_end_time) {
      console.log('Max auction extensions reached, no further extensions allowed.');
    } else if (remainingTimeMs > 0 && remainingTimeMs <= amtOfExtMs) {
      // Extend the auction end time if within the extension window and the limit hasn't been reached
      const newEndTime = auctEndTimeMs + timeFrameExtMs; // Extend by time_frame_ext in milliseconds

      // Update the auction end time and increment the number of extensions
      const updateEndTimeQuery = `
        UPDATE manage_tender
        SET auct_end_time = $1, no_of_aut_auct_ext_happened = no_of_aut_auct_ext_happened + 1
        WHERE tender_id = $2;
      `;
      await db.query(updateEndTimeQuery, [newEndTime / 1000, tender_id]); // Store back in seconds

      console.log(`Auction end time (after update): ${new Date(newEndTime).toISOString()}`);
    } else {
      console.log('Bid placed outside the extension window.');
    }

    // Insert the bid data into the tender_bid_room table
    const insertBidQuery = `
      INSERT INTO tender_bid_room (tender_id, user_id, bid_amount,fob_amount,freight_amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [tender_id, user_id, bid_amount,fob_amount,freight_amount];
    const bidResult = await db.query(insertBidQuery, values);

    // Send success response
    res.status(201).json({ 
      success: true, 
      message: 'Bid placed successfully.', 
      data: bidResult.rows[0],
      auctionExtended: remainingTimeMs > 0 && remainingTimeMs <= amtOfExtMs && no_of_aut_auct_ext_happened < aut_auct_ext_bfr_end_time ? true : false // Inform if the auction was extended
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = { submitBid };
