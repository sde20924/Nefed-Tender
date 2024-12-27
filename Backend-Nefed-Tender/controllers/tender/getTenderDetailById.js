const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get details of a specific tender by tender ID
const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
  try {
    const tenderId = req.params.id; // Extract tender ID from request parameters

    // Fetch tender details from the manage_tender table
    const tenderDetailsQuery = `
      SELECT 
        mt.*, 
        trd.doc_key, 
        trd.tender_doc_id, 
        trd.doc_label, 
        trd.doc_ext, 
        trd.doc_size
      FROM manage_tender mt
      LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
      WHERE mt.tender_id = ?
    `;
    const [tenderDetailsResult] = await db.query(tenderDetailsQuery, [tenderId]);

    if (tenderDetailsResult.length === 0) {
      return res.status(404).json({
        msg: 'Tender not found',
        success: false,
      });
    }

    // Extract main tender details
    const tenderDetails = tenderDetailsResult[0];

    // Fetch headers associated with the tender
    const headersQuery = `
      SELECT 
        header_id, 
        table_head, 
        \`order\`
      FROM tender_header
      WHERE tender_id = ?
      ORDER BY \`order\`
    `;
    const [headers] = await db.query(headersQuery, [tenderId]);

    // Fetch subtenders and their row data for each header
    const subTendersQuery = `
      SELECT 
        s.subtender_id, 
        s.subtender_name, 
        r.header_id, 
        r.row_data, 
        r.type, 
        r.\`order\`
      FROM subtender s
      JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
      WHERE r.header_id = ?
      ORDER BY r.\`order\`
    `;

    const headersWithSubTenders = await Promise.all(
      headers.map(async (header) => {
        const [subTendersResult] = await db.query(subTendersQuery, [header.header_id]);

        const subtenders = subTendersResult.reduce((acc, row) => {
          let parsedRowData;
          try {
            parsedRowData = JSON.parse(row.row_data); // Attempt to parse JSON
          } catch (e) {
            console.error(`Invalid JSON in row_data: ${row.row_data}`, e.message);
            parsedRowData = row.row_data; // Fall back to raw string if invalid JSON
          }

          const existingSubTender = acc.find((sub) => sub.id === row.subtender_id);
          if (existingSubTender) {
            existingSubTender.rows.push({
              row_data: parsedRowData,
              type: row.type,
              order: row.order,
            });
          } else {
            acc.push({
              id: row.subtender_id,
              name: row.subtender_name,
              rows: [
                {
                  row_data: parsedRowData,
                  type: row.type,
                  order: row.order,
                },
              ],
            });
          }
          return acc;
        }, []);

        return {
          header: header.table_head,
          subtenders,
        };
      })
    );

    // Combine the results
    const combinedData = {
      ...tenderDetails,
      tenderDocuments: tenderDetailsResult
        .filter((row) => row.doc_key)
        .map((doc) => ({
          doc_key: doc.doc_key,
          tender_doc_id: doc.tender_doc_id,
          doc_label: doc.doc_label,
          doc_ext: doc.doc_ext,
          doc_size: doc.doc_size,
        })),
      headers: headersWithSubTenders,
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
