const db = require('../../config/config'); // Import your database connection

/**
 * Countdown Timer logic to calculate time left for auction start and end.
 * This will return the list of tenders with countdown data.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const countDownTimer = async (req, res) => {
  try {
    // Query to fetch tender data including auction start and end times
    const tenders = await db.query('SELECT tender_id, tender_title, auct_start_time, auct_end_time, qty, app_start_time, app_end_time FROM manage_tender');
    
    const tendersWithCountdown = tenders.rows.map((tender) => {
      const now = Date.now();
      const startTimeMs = tender.auct_start_time * 1000;  // Auction start time in milliseconds
      const endTimeMs = tender.auct_end_time * 1000;      // Auction end time in milliseconds
      let timeLeft, label;

      if (now < startTimeMs) {
        // Auction hasn't started yet
        timeLeft = startTimeMs - now; 
        label = "Starting At";
      } else if (now >= startTimeMs && now <= endTimeMs) {
        // Auction is live
        timeLeft = endTimeMs - now;
        label = "Closing At";
      } else {
        // Auction has ended
        timeLeft = 0;
        label = "Auction Ended";
      }

      // Calculate hours, minutes, and seconds
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

    // Return the tenders with countdown
    return res.status(200).json({ success: true, data: tendersWithCountdown });
  } catch (error) {
    console.error('Error calculating countdown:', error.message);
    return res.status(500).json({ success: false, message: 'Error calculating countdown', error: error.message });
  }
};

module.exports = { countDownTimer };
