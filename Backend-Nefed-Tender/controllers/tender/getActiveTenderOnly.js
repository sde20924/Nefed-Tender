const db = require('../../config/config'); // Database connection

const getActiveTenders = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (Epoch time)
    const { user_id } = req.user;

    // Query to get active tenders, including public and private tenders accessible by the user
    const query = `
      SELECT * 
      FROM manage_tender mt
      WHERE mt.app_end_time > ?
        AND (
          mt.user_access = 'public' OR 
          (mt.user_access = 'private' AND EXISTS (
            SELECT 1 
            FROM tender_access ta 
            WHERE ta.tender_id = mt.tender_id 
              AND ta.buyer_id = ?
          ))
        )
        AND mt.tender_id NOT IN (
          SELECT tender_id
          FROM tender_application ta
          WHERE ta.user_id = ? 
            AND ta.status = 'accepted'
        )
      ORDER BY mt.created_at DESC, mt.app_end_time ASC
    `;

    const [result] = await db.query(query, [currentTime, user_id, user_id]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "No active tenders found." });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching active tenders:", error.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { getActiveTenders };
