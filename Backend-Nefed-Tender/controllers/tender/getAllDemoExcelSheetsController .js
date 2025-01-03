const db = require("../../config/config"); // Import database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handler middleware

// Controller to fetch all demo tender sheets with their headers
const getAllDemoExcelSheetsController = asyncErrorHandler(async (req, res) => {
  try {
    // Query to fetch all tender sheets and their headers
    const query = `
      SELECT 
        dts.demo_tender_sheet_id,
        dts.tender_table_name,
        dts.created_at AS sheet_created_at,
        dth.demo_tender_header_id,
        dth.header_display_name,
        dth.created_at AS header_created_at,
        dth.type AS type
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
      if (!acc[sheetId]) {
        acc[sheetId] = {
          tender_table_name: row.tender_table_name,
          created_at: row.sheet_created_at,
          headers: [],
        };
      }
      if (row.demo_tender_header_id) {
        acc[sheetId].headers.push({
          demo_tender_header_id: row.demo_tender_header_id,
          header_display_name: row.header_display_name,
          created_at: row.header_created_at,
          type:row.type
        });
      }
      return acc;
    }, {});

    // Convert object to array
    const responseData = Object.keys(formattedData).map((key) => ({
      demo_tender_sheet_id: key,
      ...formattedData[key],
    }));

    // Return the structured data
    res.status(200).json({
      success: true,
      data: responseData,
      message: "Demo tender sheets fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching demo tender sheets:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch demo tender sheets",
      error: error.message,
    });
  }
});

module.exports = {
  getAllDemoExcelSheetsController,
};
