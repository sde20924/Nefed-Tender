
const db = require('../../config/config'); 

// Delete Tender Controller
const deleteTenderController = async (req, res) => {
  const { id } = req.params;

  try {
    // SQL query to delete tender by tender_id
    const deleteQuery = 'DELETE FROM manage_tender WHERE tender_id = $1';
    await db.query(deleteQuery, [id]);

    res.status(200).json({ success: true, msg: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender:', error);
    res.status(500).json({ success: false, msg: 'Failed to delete tender', error: error.message });
  }
};

module.exports = {deleteTenderController};
