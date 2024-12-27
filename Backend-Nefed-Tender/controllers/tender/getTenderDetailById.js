const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get details of a specific tender by tender ID
const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
  try {
    const tenderId = req.params.id; // Extract tender ID from request parameters

    // Query to fetch tender details, associated documents, headers, sub-tenders, and row data
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
      WHERE mt.tender_id = ?
    `;

    // Execute the query with the parameterized tenderId
    const [rows] = await db.execute(tenderDetailsQuery, [tenderId]);

    // If no tender is found, return a 404 response
    if (tenderResult[0].length === 0) {
      return res.status(404).json({
        msg: 'Tender not found',
        success: false,
      });
    }

    // Extract the main tender details
    const tenderDetails = tenderResult[0].map(row => ({
      ...row, // Base tender details
    }))[0];

    // Fetch tender headers
    const headerResults = await db.query(tenderHeadersQuery, [tenderId]);
    const headers = headerResults[0].map(row => ({
      header_id: row.header_id,
      table_head: row.table_head,
      order: row.order,
    }));

    // Fetch sub-tenders for each header
    const subTenders = [];
    for (const header of headers) {
      const subTenderResult = await db.query(subTendersQuery, [header.header_id]);

      subTenders.push({
        header_id: header.header_id,
        header_name: header.table_head,
        subtenders: subTenderResult[0].map(row => ({
          subtender_id: row.subtender_id,
          subtender_name: row.subtender_name,
          row_data: JSON.parse(row.row_data), // Parse JSON data
          type: row.type,
        })),
      });
    }

    // Combine the results
    const combinedData = {
      ...tenderDetails,
      tenderDocuments: tenderResult[0]
        .filter(row => row.doc_key)
        .map(doc => ({
          doc_key: doc.doc_key,
          tender_doc_id: doc.tender_doc_id,
          doc_label: doc.doc_label,
          doc_ext: doc.doc_ext,
          doc_size: doc.doc_size,
        })),
      headers,
      subTenders,
    };

    // Return the combined data
    return res.status(200).json({
      data: combinedData,
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
