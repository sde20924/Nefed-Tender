import db from '../../config/config2.js'; // Replace with your actual path

/**
 * Controller to get tender details along with the lowest bid amount for that tender.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderMiniSummary = async (req, res) => {
  const { tender_id } = req.params;

  try {
    // Query to fetch tender details and lowest bid from the database
    const query = `
      SELECT 
        mt.tender_title, 
        mt.qty, 
        mt.dest_port, 
        mt.app_start_time,
        tbr.bid_amount, 
        tbr.fob_amount, 
        tbr.freight_amount
      FROM 
        manage_tender mt
      LEFT JOIN (
        SELECT 
          tender_id, 
          MIN(bid_amount) AS bid_amount, 
          fob_amount, 
          freight_amount
        FROM 
          tender_bid_room
        WHERE 
          tender_id = ?
        GROUP BY 
          tender_id, fob_amount, freight_amount
      ) tbr ON mt.tender_id = tbr.tender_id
      WHERE 
        mt.tender_id = ?;
    `;

    // Execute the query with the `tender_id` parameter
    const [rows] = await db.execute(query, [tender_id, tender_id]);

    // Handle case where no tender details are found
    if (rows.length === 0) {
      return res.status(404).json({
        msg: 'No tender details found for the given ID',
        success: false,
      });
    }

    // Return success response with the retrieved data
    return res.status(200).json({
      msg: 'Tender details and lowest bid retrieved successfully',
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error retrieving tender details and lowest bid:', error.message);

    // Return error response
    return res.status(500).json({
      msg: 'Error retrieving tender details and lowest bid',
      success: false,
      error: error.message,
    });
  }
};
