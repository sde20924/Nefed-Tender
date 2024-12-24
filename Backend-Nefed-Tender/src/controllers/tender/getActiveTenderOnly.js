const db = require('../../config/config'); // Database connection

const getActiveTenders = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (Epoch time)

    // Query to get only tenders where app_end_time is in the future
    const query = 'SELECT * FROM manage_tender WHERE app_end_time > $1 ORDER BY app_end_time ASC';
    const result = await db.query(query, [currentTime]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No active tenders found." });
    }

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching active tenders:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { getActiveTenders };
