const db = require("../../config/config"); // Import database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handler middleware

// Controller to fetch all demo tender sheets with their headers and subcategories
const getAllDemoExcelSheetsController = asyncErrorHandler(async (req, res) => {
  try {
    // Query to fetch all tender sheets, their headers, and subcategories
    const query = `
      SELECT 
        dts.demo_tender_sheet_id,
        dts.tender_table_name,
        dts.created_at AS sheet_created_at,
        dth.demo_tender_header_id,
        dth.header_display_name,
        dth.created_at AS header_created_at,
        dth.type AS type,
        sts.sub_tender_sheet_id,
        sts.sub_tender_table_name,
        sts.created_at AS sub_tender_created_at
      FROM 
        demo_tender_sheet dts
      LEFT JOIN 
        demo_tender_header dth 
      ON 
        dts.demo_tender_sheet_id = dth.demo_tender_sheet_id
      LEFT JOIN 
        sub_tender_sheet sts
      ON 
        dts.demo_tender_sheet_id = sts.demo_tender_sheet_id
      ORDER BY 
        dts.demo_tender_sheet_id, dth.demo_tender_header_id, sts.sub_tender_sheet_id;
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
          headers: [], // Initialize headers array
          subcategories: [] // Initialize subcategories array
        };
      }

      // Add headers if they exist, ensuring headers are added only once
      if (row.demo_tender_header_id && !acc[sheetId].headers.some(header => header.demo_tender_header_id === row.demo_tender_header_id)) {
        acc[sheetId].headers.push({
          demo_tender_header_id: row.demo_tender_header_id,
          header_display_name: row.header_display_name,
          created_at: row.header_created_at,
          type: row.type
        });
      }

      // Add subcategories if they exist, ensuring subcategories are added only once
      if (row.sub_tender_sheet_id && !acc[sheetId].subcategories.some(subcategory => subcategory.sub_tender_sheet_id === row.sub_tender_sheet_id)) {
        acc[sheetId].subcategories.push({
          sub_tender_sheet_id: row.sub_tender_sheet_id,
          sub_tender_table_name: row.sub_tender_table_name,
          created_at: row.sub_tender_created_at
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
      message: "Demo tender sheets with headers and subcategories fetched successfully",
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
