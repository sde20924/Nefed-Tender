import db from '../../config/config2.js'; // MySQL database connection

/**
 * Controller to fetch uploaded files and application status for a specific tender.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderFilesAndStatus = async (req, res) => {
  const { id: tenderId } = req.params; // Extract tender ID from request parameters

  try {
    // SQL query to fetch tender files and application status
    const query = `
      SELECT 
        tud.*, 
        ta.status AS application_status
      FROM 
        tender_user_doc tud
      LEFT JOIN 
        tender_application ta 
      ON 
        tud.tender_id = ta.tender_id
      WHERE 
        tud.tender_id = ?;
    `;

    // Execute the query with the parameterized tender ID
    const [rows] = await db.execute(query, [tenderId]);

    // Respond with the data or a 404 error if no records are found
    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No data found for this tender',
      });
    }
  } catch (error) {
    console.error('Error fetching uploaded files and application status:', error.message);

    // Respond with a 500 error for server issues
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch data',
      error: error.message,
    });
  }
};
