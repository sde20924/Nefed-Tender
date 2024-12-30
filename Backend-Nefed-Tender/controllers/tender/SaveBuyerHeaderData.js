const db = require("../../config/config");

const saveBuyerHeaderRowData = async (req, res) => {
  const user_id = req.user.user_id; // Assuming authentication middleware sets req.user
  const { formdata, headers } = req.body;

  if (!formdata || !headers) {
    return res.status(400).json({
      msg: "Required fields 'formdata' and 'headers' are missing.",
      success: false,
    });
  }

  try {
    await db.query("START TRANSACTION");

    for (const subTender of formdata) {
      const { id: subtender_id, rows } = subTender;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];

          // Only process cells with type "edit" and non-null, non-empty data
          if (cell.type === "edit" && cell.data !== null && cell.data.trim() !== "") {
            const header_id = headers[cellIndex]?.header_id;

            if (!header_id) {
              console.error(`Header ID not found for cell index ${cellIndex}`);
              continue;
            }

            // Insert data into the database
            await db.query(
              `INSERT INTO buyer_header_row_data 
              (header_id, row_data, subtender_id, buyer_id, \`order\`, row_number)
              VALUES (?, ?, ?, ?, ?, ?)`,
              [
                header_id,        // Header ID
                cell.data,        // Editable cell data
                subtender_id,     // Sub-tender ID
                user_id,          // Buyer ID
                cellIndex + 1,    // Column order
                rowIndex + 1,     // Row number
              ]
            );
          }
        }
      }
    }

    await db.query("COMMIT");

    res.status(201).json({
      msg: "Editable rows saved successfully.",
      success: true,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error saving editable rows:", error.message);

    res.status(500).json({
      msg: "Error saving editable rows.",
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  saveBuyerHeaderRowData,
};
