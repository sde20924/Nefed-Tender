import db from '../../config/config2.js'; // MySQL database connection

/**
 * Controller to delete a tender by its ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const deleteTenderController = async (req, res) => {
  const { id } = req.params; // Extract tender ID from request parameters

  try {
    // SQL query to delete the tender by tender_id
    const deleteQuery = 'DELETE FROM manage_tender WHERE tender_id = ?';

    // Execute the query with the tender_id parameter
    const [result] = await db.execute(deleteQuery, [id]);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Tender not found' 
      });
    }

    // Respond with success message
    return res.status(200).json({ 
      success: true, 
      msg: 'Tender deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting tender:', error);
    return res.status(500).json({ 
      success: false, 
      msg: 'Failed to delete tender', 
      error: error.message 
    });
  }
};
