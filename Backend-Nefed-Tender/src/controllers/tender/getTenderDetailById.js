import db from "../../config/config2.js"; // Database configuration
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Async error handler middleware

/**
 * Controller to fetch tender details by ID, including headers, sub-tenders, and documents.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
  try {
    const { id: tenderId } = req.params; // Extract tender ID from request parameters

    // Query to fetch tender details and documents
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
        msg: "Tender not found",
        success: false,
      });
    }

    // Query to fetch headers
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

    // Query to fetch subtenders and associated rows
    const headersWithSubTendersQuery = `
      SELECT 
        s.subtender_id,
        s.subtender_name,
        r.row_data_id,
        r.header_id,
        r.row_data,
        r.type,
        r.order,
        r.row_number
      FROM subtender s
      LEFT JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
      WHERE s.tender_id = ?
      ORDER BY s.subtender_id, r.row_number, r.order
    `;
    const [headersWithSubTendersResult] = await db.query(headersWithSubTendersQuery, [tenderId]);

    // Parse tender details
    let tenderDetails = {
      ...tenderDetailsResult[0],
      tenderDocuments: tenderDetailsResult
        .map((row) => ({
          doc_key: row.doc_key,
          tender_doc_id: row.tender_doc_id,
          doc_label: row.doc_label,
          doc_ext: row.doc_ext,
          doc_size: row.doc_size,
        }))
        .filter((doc) => doc.doc_key), // Filter out rows without documents
    };

    // Add headers to tender details
    tenderDetails.headers = headers;

    // Parse sub-tenders and group rows by row_number
    const subTendersArray = [];
    const subTenderMap = new Map();

    headersWithSubTendersResult.forEach((row) => {
      const subTenderId = row.subtender_id;
      const subTenderName = row.subtender_name;

      if (!subTenderMap.has(subTenderId)) {
        const newSubTender = {
          id: subTenderId,
          name: subTenderName,
          rows: [],
        };
        subTenderMap.set(subTenderId, newSubTender);
        subTendersArray.push(newSubTender);
      }

      const subTender = subTenderMap.get(subTenderId);

      // Ensure all rows, even empty ones, are included
      const rowGroup = subTender.rows[row.row_number - 1] || [];
      rowGroup[row.order - 1] = {
        data: row.row_data || "", // Default to empty string if data is missing
        type: row.type || "edit", // Default to "edit" if type is missing
      };
      subTender.rows[row.row_number - 1] = rowGroup;
    });

    // Add sub-tenders to tender details
    tenderDetails.sub_tenders = subTendersArray;

    // Send the response
    res.status(200).json({
      msg: "Tender details fetched successfully",
      success: true,
      data: tenderDetails,
    });
  } catch (error) {
    console.error("Error fetching tender details:", error.message);
    res.status(500).json({
      msg: "Error fetching tender details",
      success: false,
      error: error.message,
    });
  }
});
