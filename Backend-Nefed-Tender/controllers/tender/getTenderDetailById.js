const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get details of a specific tender by tender ID
const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
  try {
    const tenderId = req.params.id; // Extract tender ID from request parameters

    // Fetch tender details and associated documents
    const tenderDetailsQuery = `
      SELECT 
        mt.*, 
        trd.tender_doc_id, 
        trd.doc_key, 
        trd.doc_label, 
        trd.doc_ext, 
        trd.doc_size
      FROM manage_tender mt
      LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
      WHERE mt.tender_id = ?
    `;

    const [tenderRows] = await db.execute(tenderDetailsQuery, [tenderId]);

    // If no tender is found, return a 404 response
    if (tenderRows.length === 0) {
      return res.status(404).json({
        msg: 'Tender not found',
        success: false,
      });
    }

    // Extract the main tender details
    const tenderDetails = {
      ...tenderRows[0],
      tenderDocuments: tenderRows
        .filter(row => row.doc_key)
        .map(doc => ({
          tender_doc_id: doc.tender_doc_id,
          doc_key: doc.doc_key,
          doc_label: doc.doc_label,
          doc_ext: doc.doc_ext,
          doc_size: doc.doc_size,
        })),
    };

    // Fetch tender headers
    const headerQuery = `
      SELECT header_id, table_head, \`order\`
      FROM tender_header
      WHERE tender_id = ?
      ORDER BY \`order\`
    `;
    const [headerRows] = await db.execute(headerQuery, [tenderId]);

    const headers = headerRows.map(header => ({
      header_id: header.header_id,
      table_head: header.table_head,
      order: header.order,
    }));

    // Fetch sub-tenders and row data for each header
    const subTenders = [];
    for (const header of headers) {
      const subTendersQuery = `
        SELECT 
          st.subtender_id, 
          st.subtender_name, 
          shrd.row_data, 
          shrd.type
        FROM subtender st
        LEFT JOIN seller_header_row_data shrd 
          ON st.subtender_id = shrd.subtender_id
        WHERE shrd.header_id = ?
      `;

      const [subTenderRows] = await db.execute(subTendersQuery, [header.header_id]);

      const subtenderData = subTenderRows.reduce((acc, row) => {
        const existingSubTender = acc.find(st => st.subtender_id === row.subtender_id);

        if (existingSubTender) {
          existingSubTender.row_data.push({
            row: JSON.parse(row.row_data),
            type: row.type,
          });
        } else {
          acc.push({
            subtender_id: row.subtender_id,
            subtender_name: row.subtender_name,
            row_data: [
              {
                row: JSON.parse(row.row_data),
                type: row.type,
              },
            ],
          });
        }
        return acc;
      }, []);

      subTenders.push({
        header_id: header.header_id,
        header_name: header.table_head,
        subtenders: subtenderData,
      });
    }

    // Combine all the results
    const combinedData = {
      ...tenderDetails,
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
