import db from "../../config/config2.js"; // Database connection

/**
 * Controller to save buyer header row data into the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const saveBuyerHeaderRowData = async (req, res) => {
  const user_id = req.user?.user_id; // Extract `user_id` from authenticated user
  const { formdata, headers } = req.body;

  // Validate required fields
  if (!formdata || !headers) {
    return res.status(400).json({
      msg: "Required fields 'formdata' and 'headers' are missing.",
      success: false,
    });
  }

  try {
    await db.query("START TRANSACTION"); // Start database transaction

    // Loop through sub-tenders in the form data
    for (const subTender of formdata) {
      const { id: subtender_id, rows } = subTender;

      // Loop through each row in the sub-tender
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        // Loop through each cell in the row
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];

          // Process only editable cells with valid data
          if (cell.type === "edit" && cell.data?.trim()) {
            const header_id = headers[cellIndex]?.header_id;

            // Validate header ID
            if (!header_id) {
              console.error(`Header ID not found for cell index ${cellIndex}`);
              continue; // Skip to the next cell
            }

            // Insert editable cell data into the database
            await db.query(
              `INSERT INTO buyer_header_row_data 
              (header_id, row_data, subtender_id, buyer_id, \`order\`, row_number)
              VALUES (?, ?, ?, ?, ?, ?)`,
              [
                header_id,        // Header ID
                cell.data,        // Editable cell data
                subtender_id,     // Sub-tender ID
                user_id,          // Buyer ID
                cellIndex + 1,    // Column order (1-based index)
                rowIndex + 1,     // Row number (1-based index)
              ]
            );
          }
        }
      }
    }

    await db.query("COMMIT"); // Commit the transaction

    // Send success response
    res.status(201).json({
      msg: "Editable rows saved successfully.",
      success: true,
    });
  } catch (error) {
    await db.query("ROLLBACK"); // Rollback the transaction on error
    console.error("Error saving editable rows:", error.message);

    // Send error response
    res.status(500).json({
      msg: "Error saving editable rows.",
      success: false,
      error: error.message,
    });
  }
};
