import db from "../../../../models/index.js";
import axios from "axios";
import SuggestedPrice from "../../../../utils/SuggestedPrice.js";
import { emitEvent } from "../../../../socket/event/emit.js";
import { userVerifyApi } from "../../../../utils/external/api.js";

export const saveBuyerHeaderRowData = async (req, res) => {
  const user_id = req.user.user_id; // User ID from authentication middleware
  const { formdata, headers, bid_amount, tender_id } = req.body;

  if (!formdata || !headers || !bid_amount || !tender_id) {
    return res.status(400).json({
      msg: "Required fields 'formdata', 'headers', 'bid_amount', and 'tender_id' are missing.",
      success: false,
    });
  }

  const transaction = await db.sequelize.transaction(); // Start transaction

  try {
    // Buyer Details
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

    const buyerName = `${buyerDetailsResponse?.data?.data[0]?.first_name} ${buyerDetailsResponse?.data?.data[0]?.last_name}`;
    const buyerCompanyName = buyerDetailsResponse?.data?.data[0]?.company_name;

    let headersChangedByBuyers = {
      [user_id]: {
        buyer_id: user_id,
        buyer_name: buyerName,
        headers: [],
      },
    };

    let subTenderByBuyer = {
      [user_id]: {},
    };

    const headerIdsSet = new Set();

    // Save editable rows in `buyer_header_row_data`
    for (const subTender of formdata) {
      const { id: subtender_id, name: subTender_name, rows } = subTender;

      subTenderByBuyer[user_id][subtender_id] = {
        id: subtender_id,
        name: subTender_name,
        rows: [],
      };

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        let rowData = [];

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];
          const header = headers[cellIndex];
          const header_id = header?.header_id;

          if (cell.type !== "edit") {
            rowData.push(null);
            continue;
          }

          if (cell.type === "edit" && cell.data !== null) {
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

            // Insert data into `buyer_header_row_data`
            await db.sequelize.query(
              `
              INSERT INTO buyer_header_row_data 
              (header_id, row_data, subtender_id, buyer_id, \`order\`, row_number)
              VALUES (:headerId, :rowData, :subtenderId, :buyerId, :order, :rowNumber)
              `,
              {
                replacements: {
                  headerId: header_id,
                  rowData: cell.data,
                  subtenderId: subtender_id,
                  buyerId: user_id,
                  order: cellIndex + 1,
                  rowNumber: rowIndex + 1,
                },
                transaction,
              }
            );
          }
        }
      }
    }

    // Save bid details in `tender_bid_room`
    await db.sequelize.query(
      `
      INSERT INTO tender_bid_room (tender_id, user_id, bid_amount, status) 
      VALUES (:tenderId, :userId, :bidAmount, :status)
      `,
      {
        replacements: {
          tenderId: tender_id,
          userId: user_id,
          bidAmount: bid_amount,
          status: "active",
        },
        transaction,
      }
    );

    // Emit Socket Events
    const [rows] = await db.sequelize.query(
      `
      SELECT user_id 
      FROM manage_tender 
      WHERE tender_id = :tenderId
      `,
      {
        replacements: { tenderId: tender_id },

        transaction,
      }
    );

    const sellerId = rows[0]?.user_id;

    emitEvent(
      "Auction-Bid-Report",
      {
        headers: headersChangedByBuyers[user_id],
        subTender: subTenderByBuyer[user_id],
        action_type: "Auction-Bid-Report",
        buyer_id: user_id,
      },
      "seller",
      sellerId
    );

    emitEvent(
      "Tender",
      {
        message: `New Bid Added By ${buyerCompanyName}`,
        buyer_id: user_id,
        company_name: buyerCompanyName,
        tender_id,
        bid_amount,
        action_type: "New-Bid",
      },
      "seller",
      sellerId
    );

    // Emit Suggested Prices
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
              buyer_id: user_id,
              company_name: buyerCompanyName,
              tender_id,
              action_type: "Suggested-Price",
            },
            "buyer",
            null,
            user_id
          );
        }
      }
    }

    await transaction.commit();

    res.status(201).json({
      msg: "Editable rows and bid details saved successfully.",
      success: true,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving editable rows and bid details:", error.message);

    res.status(500).json({
      msg: "Error saving editable rows and bid details.",
      success: false,
      error: error.message,
    });
  }
};
