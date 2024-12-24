const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get details of a specific tender by tender ID
const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
  try {
    const tenderId = req.params.id; // Extract tender ID from request parameters

    // Query to fetch tender details and associated documents using LEFT JOIN
    const tenderDetailsQuery = `
      SELECT 
        mt.*, -- All columns from manage_tender
        trd.doc_key, 
        trd.tender_doc_id, 
        trd.doc_label, 
        trd.doc_ext, 
        trd.doc_size
      FROM manage_tender mt
      LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
      WHERE mt.tender_id = $1
    `;
    
    const { rows } = await db.query(tenderDetailsQuery, [tenderId]);

    // If no tender is found, return a 404 response
    if (rows.length === 0) {
      return res.status(404).json({
        msg: 'Tender not found',
        success: false,
      });
    }

    // Format the results to group documents under a single tender
    const tenderDetails = {
      ...rows[0], // Base tender details from the first row
      tenderDocuments: rows.map(row => ({
        doc_key: row.doc_key,
        tender_doc_id: row.tender_doc_id,
        doc_label: row.doc_label,
        doc_ext: row.doc_ext,
        doc_size: row.doc_size,
      })).filter(doc => doc.doc_key) // Filter out any rows without documents
    };

    // Return the combined data
    return res.status(200).json({
      data: tenderDetails,
      msg: 'Tender details fetched successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error fetching tender details:', error.message);
    return res.status(500).send({
      msg: 'Error fetching tender details',
      error: error.message,
      success: false,
    });
  }
});

module.exports = {
  getTenderDetailsController,
};
