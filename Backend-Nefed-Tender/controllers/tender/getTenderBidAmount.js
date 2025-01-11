const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // For handling async errors

const getTenderBids = asyncErrorHandler(async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { user_id } = req.user; // Assuming `user_name` is available in `req.user`

    if (!tender_id) {
      return res.status(400).json({ success: false, message: "Tender ID is required." });
    }

    // Fetch tender details
    const tenderDetailsQuery = `
      SELECT 
        mt.tender_title, 
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
      return res.status(404).json({ success: false, message: "Tender not found." });
    }

    const tenderDetails = {
      tender_title: tenderDetailsResult[0].tender_title,
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

    // Fetch headers
    const headersQuery = `
      SELECT header_id, table_head, \`order\`, type
      FROM tender_header
      WHERE tender_id = ?
      ORDER BY \`order\`
    `;
    const [headers] = await db.query(headersQuery, [tender_id]);

    if (!headers.length) {
      return res.status(404).json({ success: false, message: "No headers found for this tender." });
    }

    const headerIds = headers.map((header) => header.header_id);

    // Fetch buyer header row data
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
      WHERE bhrd.header_id IN (?) AND bhrd.buyer_id = ?
      ORDER BY bhrd.subtender_id ASC, bhrd.row_number ASC, bhrd.order ASC
    `;
    const [buyerHeaderData] = await db.query(buyerHeaderDataQuery, [headerIds, user_id]);

    // Organize buyer data by subtender and row
    const buyerData = buyerHeaderData.reduce((acc, row) => {
      const { subtender_id, row_number, table_head, row_data } = row;

      if (!acc[subtender_id]) acc[subtender_id] = {};
      if (!acc[subtender_id][row_number]) acc[subtender_id][row_number] = {};
      if (!acc[subtender_id][row_number][table_head]) acc[subtender_id][row_number][table_head] = [];

      acc[subtender_id][row_number][table_head].push({
        row_data_id: row.row_data_id,
        row_data,
        order: row.order,
      });
      return acc;
    }, {});

    // Fetch subtenders and organize their rows
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
      ORDER BY s.subtender_id ASC, sh.row_number ASC, sh.order ASC;
    `;
    const [subtenderResults] = await db.query(subtendersQuery, [tender_id]);

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

    // Integrate buyer data into subtenders
    Object.keys(subtenderData).forEach((subtenderId) => {
      const subtender = subtenderData[subtenderId];
      subtender.rows.forEach((row, rowIndex) => {
        if (!row) return;
        row.forEach((cell, cellIndex) => {
          if (cell.type === "edit") {
            const header = headers.find((h) => h.header_id === cell.header_id);
            if (header) {
              const tableHead = header.table_head;
              const buyerRowDataArray = buyerData[subtenderId]?.[rowIndex + 1]?.[tableHead] || [];
              if (buyerRowDataArray.length > 0) {
                subtender.rows[rowIndex][cellIndex].buyer_data = buyerRowDataArray;
              }
            }
          }
        });
      });
    });

    // Fetch user bids
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

    res.status(200).json({
      success: true,
      message: "Tender bids and buyer data fetched successfully.",
      data: {
        tenderDetails, // Contains tender_title and tenderDocuments
        headers, // All headers
        subTenders: subtenderData, // Subtender rows with integrated buyer data
        userBids, // User's bids
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
