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

    //buyer Details
    const headerIdsSet = new Set();
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

    let headersChangedByBuyers = {
      [user_id]: {
        buyer_id: user_id,
        buyer_name:
          buyerDetailsResponse?.data?.data[0]?.first_name +
          " " +
          buyerDetailsResponse?.data?.data[0]?.last_name,
        headers: [],
      },
    };

    let subTenderByBuyer = {
      [user_id]: {},
    };

    // Save editable rows in buyer_header_row_dat
    for (const subTender of formdata) {
      const { id: subtender_id, name: subTender_name, rows } = subTender;

      subTenderByBuyer[user_id][subtender_id] = {
        id: subtender_id,
        name: subTender_name,
        rows: [],
      };

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const rowData = [];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];
          const header = headers[cellIndex];
          const header_id = header?.header_id;

          if (cell.type !== "edit") {
            rowData.push(null);
          }

          // Only process cells with type "edit" and non-null, non-empty data
          if (
            cell.type === "edit" &&
            cell.data !== null &&
            cell.data.trim() !== ""
          ) {
            if (!header_id) {
              console.error(`Header ID not found for cell index ${cellIndex}`);
              continue;
            }

            // Add header information to headersChangedByBuyers
            if (!headerIdsSet.has(header_id)) {
              headersChangedByBuyers[user_id].headers.push({
                header_id,
                header_name: header.table_head,
                buyer_id: user_id,
              });
              headerIdsSet.add(header_id); // Add the header_id to the Set
            }

            // Add row information to subTenderByBuyer
            rowData.push({
              header_id,
              row_data: cell.data,
              type: "edit",
              buyer_id: user_id,
              row_number: rowIndex + 1,
              order: cellIndex + 1,
            });

            subTenderByBuyer[user_id][subtender_id].rows.push(rowData);
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

    /*########## Socket Start #########  */

    const [rows] = await db.query(
      `SELECT user_id FROM manage_tender WHERE tender_id = ?`,
      [tender_id]
    );

    emitEvent(
      "Auction-Bid-Report",
      {
        headers: headersChangedByBuyers[user_id],
        subTender: subTenderByBuyer[user_id],
        action_type: "Auction-Bid-Report",
        buyer_id: user_id,
      },
      "seller",
      rows[0]?.user_id
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
    /*########## Socket End #########  */

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
