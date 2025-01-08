const db = require("../../config/config");
const { emitEvent } = require("../../socket/event/emit");
const { userVerifyApi } = require("../../utils/external/api");
const axios = require("axios");
const { SuggestedPrice } = require("../../utils/SuggestedPrice");

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
            cell.data !== null 
            
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

    const [rows] = await db.query(
      `SELECT user_id FROM manage_tender WHERE tender_id = ?`,
      [tender_id]
    );

    //buyer Details
    const token = req.headers["authorization"];

    const buyerDetailsResponse = await axios.post(
      userVerifyApi + "taqw-yvsu",
      {
        required_keys: "*",
        user_ids: [
          {
            type: "buyer",
            user_id: req.user?.user_id,
          },
        ],
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    emitEvent(
      "Tender",
      {
        message: `New Bid Added By ${buyerDetailsResponse?.data?.data[0]?.company_name}`,
        buyer_id: req.user.user_id,
        company_name: buyerDetailsResponse?.data?.data[0]?.company_name,
        tender_id: tender_id,
        bid_amount: bid_amount,
        action_type: "New-Bid",
      },
      "seller",
      rows[0]?.user_id
    );

    const suggestedPrices = await SuggestedPrice(tender_id, user_id);

    if (suggestedPrices.success) {
      for (const suggestedData of suggestedPrices.suggestedPrices) {
        for (const item of suggestedData.items) {
          if (item.suggested_price === null) {
            continue;
          }

          emitEvent(
            "Tender",
            {
              message: `Suggested price for item "${item.item_name}" in ${suggestedData.subtender_name}: ${item.suggested_price}`,
              buyer_id: req.user.user_id,
              company_name: buyerDetailsResponse?.data?.data[0]?.company_name,
              tender_id: tender_id,
              action_type: "Suggested-Price",
            },
            "buyer",
            null,
            req.user.user_id
          );
        }
      }
    }

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
