import db from "../../config/config2.js"; // Import database connection
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Error handler middleware

/**
 * Controller to fetch all demo tender sheets with their headers.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getAllDemoExcelSheetsController = asyncErrorHandler(async (req, res) => {
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

    // Execute the query
    const [results] = await db.execute(query);

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
    const responseData = Object.entries(formattedData).map(([key, value]) => ({
      demo_tender_sheet_id: key,
      ...value,
    }));

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
});
