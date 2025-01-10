import db from "../../../models/index.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

export const getTenderDetailsController = asyncErrorHandler(
  async (req, res) => {
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
      WHERE mt.tender_id = :tenderId
    `;
      const [tenderDetailsResult] = await db.sequelize.query(
        tenderDetailsQuery,
        {
          replacements: { tenderId },
        }
      );

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
      WHERE tender_id = :tenderId
      ORDER BY \`order\`
    `;
      const [headers] = await db.sequelize.query(headersQuery, {
        replacements: { tenderId },
      });

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
      WHERE s.tender_id = :tenderId
      ORDER BY s.subtender_id, r.row_number, r.order
    `;
      const [headersWithSubTendersResult] = await db.sequelize.query(
        headersWithSubTendersQuery,
        { replacements: { tenderId } }
      );

      // Parse tender details
      const tenderDetails = {
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
  }
);

export const getAllDemoExcelSheetsController = asyncErrorHandler(
  async (req, res) => {
    try {
      // SQL query to fetch demo tender sheets and their headers
      const query = `
      SELECT 
        dts.demo_tender_sheet_id,
        dts.tender_table_name,
        dts.created_at AS sheet_created_at,
        dth.demo_tender_header_id,
        dth.header_display_name,
        dth.created_at AS header_created_at
      FROM 
        demo_tender_sheet dts
      LEFT JOIN 
        demo_tender_header dth 
      ON 
        dts.demo_tender_sheet_id = dth.demo_tender_sheet_id
      ORDER BY 
        dts.demo_tender_sheet_id, dth.demo_tender_header_id;
    `;

      // Execute the query using Sequelize
      const [results] = await db.sequelize.query(query);

      // Organize results into a structured format
      const formattedData = results.reduce((acc, row) => {
        const sheetId = row.demo_tender_sheet_id;

        // Initialize sheet entry if it doesn't exist
        if (!acc[sheetId]) {
          acc[sheetId] = {
            tender_table_name: row.tender_table_name,
            created_at: row.sheet_created_at,
            headers: [],
          };
        }

        // Add header information if available
        if (row.demo_tender_header_id) {
          acc[sheetId].headers.push({
            demo_tender_header_id: row.demo_tender_header_id,
            header_display_name: row.header_display_name,
            created_at: row.header_created_at,
          });
        }

        return acc;
      }, {});

      // Convert the formatted data object into an array for the response
      const responseData = Object.entries(formattedData).map(
        ([key, value]) => ({
          demo_tender_sheet_id: key,
          ...value,
        })
      );

      // Respond with the formatted data
      res.status(200).json({
        success: true,
        message: "Demo tender sheets fetched successfully",
        data: responseData,
      });
    } catch (error) {
      console.error("Error fetching demo tender sheets:", error.message);

      // Respond with error details
      res.status(500).json({
        success: false,
        message: "Failed to fetch demo tender sheets",
        error: error.message,
      });
    }
  }
);

export const getTenderFilesAndStatus = asyncErrorHandler(async (req, res) => {
  const { id: tenderId } = req.params; // Extract tender ID from request parameters

  try {
    // SQL query to fetch tender files and application status
    const query = `
      SELECT 
        tud.*, 
        ta.status AS application_status
      FROM 
        tender_user_doc tud
      LEFT JOIN 
        tender_application ta 
      ON 
        tud.tender_id = ta.tender_id
      WHERE 
        tud.tender_id = :tenderId;
    `;

    // Execute the query with Sequelize's query method
    const [rows] = await db.sequelize.query(query, {
      replacements: { tenderId }, 
    });

    // Respond with the data or a 404 error if no records are found
    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No data found for this tender',
      });
    }
  } catch (error) {
    console.error('Error fetching uploaded files and application status:', error.message);

    // Respond with a 500 error for server issues
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch data',
      error: error.message,
    });
  }
});

