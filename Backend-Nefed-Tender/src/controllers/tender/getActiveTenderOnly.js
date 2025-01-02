import db from '../../config/config2.js'; // Database connection

/**
 * Fetches active tenders where the application end time is in the future.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getActiveTenders = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (Epoch time)

    // Query to get tenders with application end time in the future
    const query = `
      SELECT * 
      FROM manage_tender 
      WHERE app_end_time > ? 
      ORDER BY app_end_time ASC
    `;
    const [result] = await db.query(query, [currentTime]);

    // Handle case where no active tenders are found
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active tenders found."
      });
    }

    // Return active tenders
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching active tenders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};
