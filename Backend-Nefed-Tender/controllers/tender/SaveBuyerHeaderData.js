const db = require("../../config/config");

const saveBuyerHeaderRowData = async (req, res) => {
  const user_id = req.user.user_id; // User ID from authentication middleware
  const { formdata, headers, bid_amount, tender_id } = req.body;

  if (!formdata || !headers || !bid_amount || !tender_id) {
    return res.status(400).json({
      msg: "Required fields 'formdata', 'headers', 'bid_amount', and 'tender_id' are missing.",
      success: false,
    });
  }

  try {
    await db.query("START TRANSACTION");

    // Save editable rows in buyer_header_row_dat
    for (const subTender of formdata) {
      const { id: subtender_id, rows } = subTender;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];

          // Only process cells with type "edit" and non-null, non-empty data
          if (
            cell.type === "edit" &&
            cell.data !== null &&
            cell.data.trim() !== ""
          ) {
            const header_id = headers[cellIndex]?.header_id;

            if (!header_id) {
              console.error(`Header ID not found for cell index ${cellIndex}`);
              continue;
            }

            // Insert data into the buyer_header_row_data table
            await db.query(
              `INSERT INTO buyer_header_row_data 
              (header_id, row_data, subtender_id, buyer_id, \`order\`, row_number)
              VALUES (?, ?, ?, ?, ?, ?)`,
              [
                header_id, // Header ID
                cell.data, // Editable cell data
                subtender_id, // Sub-tender ID
                user_id, // Buyer ID
                cellIndex + 1, // Column order
                rowIndex + 1, // Row number
              ]
            );
          }
        }
      }
    }

    // Save bid details in tender_bid_room table
    const status = "active"; // Default status
    await db.query(
      `INSERT INTO tender_bid_room (tender_id, user_id, bid_amount, status) 
      VALUES (?, ?, ?, ?)`,
      [
        tender_id, // Tender ID
        user_id, // User ID (buyer)
        bid_amount, // Bid amount
        status, // Status (default 'active')
      ]
    );

    await db.query("COMMIT");

    res.status(201).json({
      msg: "Editable rows and bid details saved successfully.",
      success: true,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error saving editable rows and bid details:", error.message);

    res.status(500).json({
      msg: "Error saving editable rows and bid details.",
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  saveBuyerHeaderRowData,
};
