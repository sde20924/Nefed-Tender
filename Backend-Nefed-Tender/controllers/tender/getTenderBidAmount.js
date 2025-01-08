const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // For handling async errors

const getTenderBids = asyncErrorHandler(async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { user_id } = req.user;

    // Ensure the tender_id is provided
    if (!tender_id) {
      return res.status(400).json({ success: false, message: "Tender ID is required." });
    }

    // Fetch tender details
    const tenderDetailsQuery = `
      SELECT 
        mt.*,
        trd.doc_key, 
        trd.tender_doc_id, 
        trd.doc_label, 
        trd.doc_ext, 
        trd.doc_size
      FROM manage_tender mt
      LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
      WHERE mt.tender_id = ?
    `;
    const [tenderDetailsResult] = await db.query(tenderDetailsQuery, [tender_id]);

    if (tenderDetailsResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tender not found.",
      });
    }

    // Parse tender details
    const tenderDetails = {
      ...tenderDetailsResult[0],
      tenderDocuments: tenderDetailsResult
        .map((doc) => ({
          doc_key: doc.doc_key,
          tender_doc_id: doc.tender_doc_id,
          doc_label: doc.doc_label,
          doc_ext: doc.doc_ext,
          doc_size: doc.doc_size,
        }))
        .filter((doc) => doc.doc_key),
    };

    // Fetch bids by the logged-in user for the tender
    const userBidsQuery = `
      SELECT 
        bid_id, 
        tender_id, 
        user_id, 
        bid_amount, 
        created_at, 
        status 
      FROM tender_bid_room 
      WHERE tender_id = ? AND user_id = ? 
      ORDER BY created_at DESC
    `;
    const [userBids] = await db.query(userBidsQuery, [tender_id, user_id]);

    if (userBids.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bids found for this tender from the logged-in user.",
      });
    }

    // Fetch headers for the tender
    const headersQuery = `
      SELECT header_id, table_head, \`order\`, type
      FROM tender_header
      WHERE tender_id = ?
      ORDER BY \`order\`
    `;
    const [headers] = await db.query(headersQuery, [tender_id]);

    // Fetch data from buyer_header_row_data
    const buyerHeaderDataQuery = `
      SELECT 
        bhrd.row_data_id,
        bhrd.header_id, 
        th.table_head, 
        bhrd.row_data, 
        bhrd.row_number, 
        bhrd.subtender_id, 
        bhrd.order
      FROM buyer_header_row_data AS bhrd
      JOIN tender_header AS th ON bhrd.header_id = th.header_id
      WHERE header_id IN (?) AND buyer_id = ?
      ORDER BY bhrd.row_number ASC, th.order ASC
    `;
    const [buyerHeaderData] = await db.query(buyerHeaderDataQuery, [tender_id, user_id]);

    // Group buyer header data by subtender_id and row_number
    const buyerData = buyerHeaderData.reduce((acc, row) => {
      const { subtender_id, row_number, table_head, row_data } = row;

      if (!acc[subtender_id]) acc[subtender_id] = {};
      if (!acc[subtender_id][row_number]) acc[subtender_id][row_number] = {};

      acc[subtender_id][row_number][table_head] = row_data;
      return acc;
    }, {});

    // Fetch sub-tenders and group rows
    const subtendersQuery = `
      SELECT 
        s.subtender_id,
        s.subtender_name,
        sh.header_id AS seller_header_id,
        sh.row_data AS seller_row_data,
        sh.type AS seller_type,
        sh.order AS seller_order,
        sh.row_number AS seller_row_number
      FROM subtender s
      LEFT JOIN seller_header_row_data sh 
        ON s.subtender_id = sh.subtender_id
      WHERE s.tender_id = ?
      ORDER BY s.subtender_id, sh.row_number, sh.order;
    `;
    const [subtenderResults] = await db.query(subtendersQuery, [tender_id]);

    // Group sub-tender rows
    const subtenderData = subtenderResults.reduce((acc, row) => {
      const {
        subtender_id,
        subtender_name,
        seller_header_id,
        seller_row_data,
        seller_row_number,
        seller_order,
        seller_type,
      } = row;

      if (!acc[subtender_id]) {
        acc[subtender_id] = {
          id: subtender_id,
          name: subtender_name,
          rows: [],
        };
      }

      const subtender = acc[subtender_id];
      if (!subtender.rows[seller_row_number - 1]) {
        subtender.rows[seller_row_number - 1] = [];
      }

      subtender.rows[seller_row_number - 1][seller_order - 1] = {
        header_id: seller_header_id,
        row_data: seller_row_data || "",
        type: seller_type || "view",
      };

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Tender bids and buyer data fetched successfully.",
      data: {
        tenderDetails,
        headers,
        subTenders: subtenderData,
        buyerData,
        userBids,
      },
    });
  } catch (error) {
    console.error("Error fetching tender bids:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tender bids.",
      error: error.message,
    });
  }
});

module.exports = { getTenderBids };
