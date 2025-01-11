import db from "../../../../models/index.js";
import axios from "axios";
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";
import { userVerifyApi } from "../../../../utils/external/api.js";
import SuggestedPrice from "../../../../utils/SuggestedPrice.js";

export const getSellerBuyerList = asyncErrorHandler(async (req, res) => {
  const { demo_tender_sheet_id } = req.body;

  const query = `
    SELECT seller_buyer_id, seller_id, buyer_id, createdAt, demo_tender_sheet_id
    FROM seller_buyer
    WHERE 1 
    ${
      demo_tender_sheet_id
        ? "AND demo_tender_sheet_id = :demoTenderSheetId"
        : ""
    }
  `;

  try {
    const token = req.headers["authorization"];

    // Execute query using db.Sequelize
    const [rows] = await db.sequelize.query(query, {
      replacements: demo_tender_sheet_id
        ? { demoTenderSheetId: demo_tender_sheet_id }
        : {},
    });

    const sellerBuyerData = rows;

    // Map user IDs for API call
    const user_ids = sellerBuyerData.map((buyer) => ({
      type: "buyer",
      user_id: buyer.buyer_id,
    }));

    // Fetch buyer details from external API
    const buyerDetailsResponse = await axios.post(
      `${userVerifyApi}taqw-yvsu`,
      {
        required_keys: "*",
        user_ids,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const buyerDetails = buyerDetailsResponse.data;

    // Respond with buyer details
    res.status(200).json(buyerDetails);
  } catch (error) {
    console.error("Error fetching buyer list:", error.message);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch buyer list",
      error: error.message,
    });
  }
});

export const getAccessBidWithSuggestedPrice = asyncErrorHandler(
  async (req, res) => {
    const tenderId = req.params.id; // Extract tender ID from request parameters
    const { user_id } = req.user;

    const transaction = await db.sequelize.transaction(); // Start transaction

    try {
      // Step 1: Check if the buyer has participated in the tender
      const [bidParticipationResult] = await db.sequelize.query(
        `
            SELECT COUNT(*) AS bid_count
            FROM tender_bid_room
            WHERE tender_id = :tenderId AND user_id = :userId
            `,
        {
          replacements: { tenderId, userId: user_id },

          transaction,
        }
      );
      const hasParticipated = bidParticipationResult[0].bid_count > 0;

      // Step 2: Fetch tender details from the manage_tender table
      const [tenderDetailsResult] = await db.sequelize.query(
        `
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
            `,
        {
          replacements: { tenderId },

          transaction,
        }
      );

      if (tenderDetailsResult.length === 0) {
        await transaction.rollback(); // Rollback if tender not found
        return res.status(404).json({
          msg: "Tender not found",
          success: false,
        });
      }

      // Parse tender details and map document details
      let tenderDetails = {
        ...tenderDetailsResult[0],
        tenderDocuments: tenderDetailsResult
          .map((row) => ({
            doc_key: row.doc_key,
            tender_doc_id: row.tender_doc_id,
            doc_label: row.doc_label,
            doc_ext: row.doc_ext,
            doc_size: row.doc_size,
          }))
          .filter((doc) => doc.doc_key), // Filter out any rows without documents
      };

      // Step 3: Fetch headers and identify those with type "edit"
      const [headers] = await db.sequelize.query(
        `
            SELECT 
                header_id, 
                table_head, 
                \`order\`,
                type
            FROM tender_header
            WHERE tender_id = :tenderId
            ORDER BY \`order\`
            `,
        {
          replacements: { tenderId },

          transaction,
        }
      );

      // Fetch the latest data for "edit" type headers from buyer_header_row_data
      const editableHeaderIds = headers
        .filter((h) => h.type === "edit")
        .map((h) => h.header_id);
      let headerRowData = [];

      if (editableHeaderIds.length > 0) {
        const [headerRowDataResult] = await db.sequelize.query(
          `
                SELECT 
                    DISTINCT header_id, 
                    row_data, 
                    row_number, 
                    subtender_id
                FROM buyer_header_row_data AS bhrd
                JOIN (
                    SELECT 
                        MAX(row_data_id) AS latest_id
                    FROM buyer_header_row_data
                    WHERE header_id IN (:editableHeaderIds) AND buyer_id = :userId
                    GROUP BY header_id, row_number, subtender_id
                ) AS latest ON bhrd.row_data_id = latest.latest_id
                `,
          {
            replacements: { editableHeaderIds, userId: user_id },

            transaction,
          }
        );
        headerRowData = headerRowDataResult;
      }

      // Step 4: Fetch subtenders and group rows
      const [headersWithSubTendersResult] = await db.sequelize.query(
        `
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
            `,
        {
          replacements: { tenderId },

          transaction,
        }
      );

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

        const rowGroup = subTender.rows[row.row_number - 1] || [];
        rowGroup[row.order - 1] = {
          data: row.row_data || "", // Use empty string for missing data
          type: row.type || "edit", // Default to editable for missing rows
        };

        // Override data for editable headers if available
        const matchingHeaderData = headerRowData.find(
          (d) =>
            d.header_id === row.header_id &&
            d.row_number === row.row_number &&
            d.subtender_id === row.subtender_id
        );

        if (matchingHeaderData) {
          rowGroup[row.order - 1].data = matchingHeaderData.row_data;
        }

        subTender.rows[row.row_number - 1] = rowGroup;
      });

      tenderDetails.headers = headers;
      tenderDetails.sub_tenders = subTendersArray;

      // Calculate suggested prices
      const suggestedPrices = await SuggestedPrice(tenderId, user_id);
      console.log("DVFWSVGRBVGEB", suggestedPrices);
      tenderDetails.suggested_prices = suggestedPrices;

      // Step 5: Fetch Latest Bid Details
      const [latestBidResult] = await db.sequelize.query(
        `
            SELECT 
                bid_id,
                tender_id,
                bid_amount,
                created_at,
                status
            FROM tender_bid_room
            WHERE tender_id = :tenderId AND user_id = :userId
            ORDER BY created_at DESC
            LIMIT 1
            `,
        {
          replacements: { tenderId, userId: user_id },

          transaction,
        }
      );

      const latestBid =
        latestBidResult.length > 0
          ? {
              bid_id: latestBidResult[0].bid_id,
              tender_id: latestBidResult[0].tender_id,
              bid_amount: latestBidResult[0].bid_amount,
              created_at: latestBidResult[0].created_at,
              status: latestBidResult[0].status,
            }
          : {
              bid_id: null,
              tender_id: tenderId,
              bid_amount: 0, // Default bid amount for non-participating users
              created_at: null,
              status: "no participation",
            };

      // Add latest bid to tenderDetails
      tenderDetails.latest_bid = latestBid;

      // Commit transaction
      await transaction.commit();

      // Respond with tender details
      res.status(200).json({
        msg: "Tender details fetched successfully",
        success: true,
        data: tenderDetails,
      });
    } catch (error) {
      await transaction.rollback(); // Rollback if error occurs
      console.error("Error fetching tender details:", error.message);
      res.status(500).json({
        msg: "Error fetching tender details",
        success: false,
        error: error.message,
      });
    }
  }
);
