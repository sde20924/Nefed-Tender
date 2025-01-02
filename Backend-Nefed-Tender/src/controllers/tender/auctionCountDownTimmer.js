import db from '../../config/config2.js'; // Import database connection

/**
 * Countdown Timer logic to calculate time left for auction start and end.
 * Returns the list of tenders with countdown data.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const countDownTimer = async (req, res) => {
  try {
    // Fetch tender data including auction start and end times
    const [tenders] = await db.query(`
      SELECT 
        tender_id, 
        tender_title, 
        auct_start_time, 
        auct_end_time, 
        qty, 
        app_start_time, 
        app_end_time 
      FROM manage_tender
    `);

    const tendersWithCountdown = tenders.map((tender) => {
      const now = Date.now();
      const startTimeMs = tender.auct_start_time * 1000; // Convert to milliseconds
      const endTimeMs = tender.auct_end_time * 1000;     // Convert to milliseconds
      let timeLeft = 0;
      let label = "Auction Ended";

      if (now < startTimeMs) {
        // Auction hasn't started yet
        timeLeft = startTimeMs - now;
        label = "Starting At";
      } else if (now >= startTimeMs && now <= endTimeMs) {
        // Auction is live
        timeLeft = endTimeMs - now;
        label = "Closing At";
      }

      // Format hours, minutes, and seconds
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return {
        tender_id: tender.tender_id,
        tender_title: tender.tender_title,
        qty: tender.qty,
        app_start_time: tender.app_start_time,
        app_end_time: tender.app_end_time,
        countdown: {
          label, // Starting At, Closing At, Auction Ended
          time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, // Time left
        },
      };
    });

    // Send response with the tender data and countdown
    return res.status(200).json({ success: true, data: tendersWithCountdown });
  } catch (error) {
    console.error('Error calculating countdown:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error calculating countdown', 
      error: error.message 
    });
  }
};
