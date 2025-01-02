import db from '../../config/config2.js'; // MySQL database configuration

/**
 * Controller to get submitted tender applications for tenders created by the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getSubmittedTenderApplications = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Validate user authentication
    if (!user_id) {
      return res.status(400).json({
        msg: 'User not authenticated',
        success: false,
      });
    }

    // Query to fetch tenders created by the user
    const tenderIdsQuery = `
      SELECT tender_id, tender_title 
      FROM manage_tender 
      WHERE user_id = ?
    `;
    const [tenderIdsResult] = await db.execute(tenderIdsQuery, [user_id]);

    // Check if no tenders are found
    if (tenderIdsResult.length === 0) {
      return res.status(404).json({
        msg: 'No tenders found for the user',
        success: false,
      });
    }

    // Extract tender IDs
    const tenderIds = tenderIdsResult.map(({ tender_id }) => tender_id);

    // Prepare placeholders for the IN clause
    const placeholders = tenderIds.map(() => '?').join(',');

    // Query to fetch submitted applications for the user's tenders
    const applicationsQuery = `
      SELECT 
        ta.*, 
        mt.tender_title
      FROM 
        tender_application ta
      INNER JOIN 
        manage_tender mt 
      ON 
        ta.tender_id = mt.tender_id
      WHERE 
        ta.tender_id IN (${placeholders}) 
        AND ta.status = 'submitted'
    `;
    const [applicationsResult] = await db.execute(applicationsQuery, tenderIds);

    // Check if no applications are found
    if (applicationsResult.length === 0) {
      return res.status(404).json({
        msg: 'No submitted applications found for the user tenders',
        success: false,
      });
    }

    // Return the result
    return res.status(200).json({
      msg: 'Submitted tender applications retrieved successfully',
      success: true,
      data: applicationsResult,
    });
  } catch (error) {
    console.error('Error retrieving submitted tender applications:', error.message);

    // Handle server errors
    return res.status(500).json({
      msg: 'Error retrieving submitted tender applications',
      success: false,
      error: error.message,
    });
  }
};
