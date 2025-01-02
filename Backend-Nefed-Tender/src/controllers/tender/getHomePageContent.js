import db from '../../config/config2.js'; // MySQL database connection

/**
 * Controller to fetch the latest homepage content.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getHomepageContent = async (req, res) => {
  try {
    // Query to fetch the latest row based on the primary key
    const query = 'SELECT * FROM homepage_content ORDER BY id DESC LIMIT 1';

    // Execute the query
    const [rows] = await db.execute(query);

    // Check if any rows are returned
    if (rows.length > 0) {
      // Return the latest row
      return res.status(200).json({
        success: true,
        data: rows[0],
      });
    } else {
      // No data found
      return res.status(404).json({
        success: false,
        message: 'No homepage content found.',
      });
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error.message);

    // Return an error response
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage content.',
      error: error.message,
    });
  }
};
