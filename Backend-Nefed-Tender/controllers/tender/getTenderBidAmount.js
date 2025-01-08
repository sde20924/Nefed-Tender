const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // For handling async errors

const getTenderBids = asyncErrorHandler(async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { user_id: buyer_id } = req.user;

    if (!tender_id) {
      return res.status(400).json({ success: false, message: "Tender ID is required." });
    }

    // Fetch tender details
    const tenderDetailsQuery = `
      SELECT mt.tender_title
      FROM manage_tender mt
      WHERE mt.tender_id = ?
    `;
    const [tenderDetailsResult] = await db.query(tenderDetailsQuery, [tender_id]);

    if (!tenderDetailsResult.length) {
      return res.status(404).json({ success: false, message: "Tender not found." });
    }

    const tenderDetails = {
      tender_title: tenderDetailsResult[0].tender_title,
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

    const viewHeaders = headers.filter((header) => header.type === "view");
    const editHeaders = headers.filter((header) => header.type === "edit");

    // Fetch subtenders and rows
    const subtendersQuery = `
      SELECT 
        s.subtender_id,
        s.subtender_name,
        sh.header_id AS seller_header_id,
        sh.row_data AS seller_row_data,
        sh.row_number AS seller_row_number,
        sh.order AS seller_order,
        h.type AS header_type
      FROM subtender s
      LEFT JOIN seller_header_row_data sh 
        ON s.subtender_id = sh.subtender_id
      LEFT JOIN tender_header h
        ON sh.header_id = h.header_id
      WHERE s.tender_id = ?
      ORDER BY s.subtender_id ASC, sh.row_number ASC, sh.order ASC
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
        header_type,
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

      if (header_type === "view") {
        subtender.rows[seller_row_number - 1][seller_order - 1] = {
          header_id: seller_header_id,
          row_data: seller_row_data || "",
          type: "view",
          row_number: seller_row_number,
          order: seller_order,
        };
      }

      return acc;
    }, {});

    // Fetch buyer header row data for editable headers
    const editableHeaderIds = editHeaders.map((header) => header.header_id);

    const buyerHeaderDataQuery = `
      SELECT 
        bhrd.header_id,
        bhrd.row_data,
        bhrd.row_number,
        bhrd.order,
        bhrd.subtender_id
      FROM buyer_header_row_data bhrd
      WHERE bhrd.header_id IN (?)
        AND bhrd.buyer_id = ?
      ORDER BY bhrd.subtender_id ASC, bhrd.row_number ASC, bhrd.order ASC
    `;
    const [buyerHeaderData] = await db.query(buyerHeaderDataQuery, [editableHeaderIds, buyer_id]);

    // Organize buyer's changes by subtender and row
    const subTendersByBuyer = {};
    buyerHeaderData.forEach((row) => {
      const { subtender_id, header_id, row_data, row_number, order } = row;

      if (!subTendersByBuyer[subtender_id]) {
        subTendersByBuyer[subtender_id] = {
          id: subtender_id,
          rows: [],
        };
      }

      const subtender = subTendersByBuyer[subtender_id];

      if (!subtender.rows[row_number - 1]) {
        subtender.rows[row_number - 1] = [];
      }

      if (!subtender.rows[row_number - 1][order - 1]) {
        subtender.rows[row_number - 1][order - 1] = [];
      }

      subtender.rows[row_number - 1][order - 1].push({
        header_id,
        row_data,
        type: "edit",
        row_number,
        order,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        tenderDetails,
        headers: viewHeaders.map((header) => ({
          header_id: header.header_id,
          table_head: header.table_head,
          order: header.order,
        })),
        sub_tenders: subtenderData,
        subTendersByBuyer, // Organized by subtender with all header modifications
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
