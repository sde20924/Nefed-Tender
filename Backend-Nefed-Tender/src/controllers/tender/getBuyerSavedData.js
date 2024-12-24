const db = require('../../config/config');

// Controller to fetch uploaded files and application status for a tender
const getTenderFilesAndStatus = async (req, res) => {
  const tenderId = req.params.id;

  try {
    // Define SQL query with JOIN to include tender_application status
    const sql = `
      SELECT tud.*, ta.status AS application_status
      FROM tender_user_doc tud
      LEFT JOIN tender_application ta ON tud.tender_id = ta.tender_id
      WHERE tud.tender_id = $1;
    `;

    const result = await db.query(sql, [tenderId]);

    if (result.rows.length) {
      res.status(200).json({ success: true, data: result.rows });
    } else {
      res.status(404).json({ success: false, message: 'No data found for this tender' });
    }
  } catch (error) {
    console.error('Error fetching uploaded files and application status:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
};

module.exports = { getTenderFilesAndStatus };
