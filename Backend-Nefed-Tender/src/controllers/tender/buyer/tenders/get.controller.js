import db from "../../../../models/index.js";
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

export const getTenderApplicationsByUser = asyncErrorHandler(
  async (req, res) => {
    const { user_id } = req.user; // Extract `user_id` from the decoded token

    try {
      // Query to fetch tender applications and their associated tender titles
      const query = `
     SELECT ta.*, mt.tender_title , mt.tender_desc ,mt.auct_start_time , mt.auct_end_time
      FROM tender_application ta
      INNER JOIN manage_tender mt ON ta.tender_id = mt.tender_id
       WHERE ta.user_id = :userId
    `;

      // Execute the query using Sequelize
      const [result] = await db.sequelize.query(query, {
        replacements: { userId: user_id },
      });

      // Handle case where no applications are found
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: "No tender applications found for the user",
          data: [],
        });
      }

      // Respond with the fetched applications
      res.status(200).json({
        success: true,
        msg: "Tender applications retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error retrieving tender applications:", error.message);

      // Respond with error details
      res.status(500).json({
        success: false,
        msg: "Error retrieving tender applications",
        error: error.message,
      });
    }
  }
);

export const getActiveTenders = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (Epoch time)
    const { user_id } = req.user;

    // Query to get active tenders, including public and private tenders accessible by the user
    const query = `
      SELECT * 
      FROM manage_tender mt
      WHERE mt.app_end_time > :currentTime
        AND (
          mt.user_access = 'public' OR 
          (mt.user_access = 'private' AND EXISTS (
            SELECT 1 
            FROM tender_access ta 
            WHERE ta.tender_id = mt.tender_id 
              AND ta.buyer_id = :userId
          ))
        )
        AND mt.tender_id NOT IN (
          SELECT tender_id
          FROM tender_application ta
          WHERE ta.user_id = :userId 
            AND ta.status = 'accepted'
        )
      ORDER BY mt.created_at DESC, mt.app_end_time ASC
    `;

    // Execute the query with parameter replacements
    const result = await db.sequelize.query(query, {
      replacements: {
        currentTime,
        userId: user_id,
      },
    });

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No active tenders found." });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching active tenders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getBidDetails = asyncErrorHandler(async (req, res) => {
  const user_id = req.user.user_id; // Extract the user ID from the middleware
  const { tender_id } = req.query; // Get the tender ID from query params

  if (!tender_id) {
    return res.status(400).json({
      msg: "Tender ID is required.",
      success: false,
    });
  }

  try {
    // Fetch all bids for the given tender ID, ordered by bid amount ASC (lowest to highest)
    const [allBids] = await db.sequelize.query(
      `SELECT * FROM tender_bid_room WHERE tender_id = :tenderId ORDER BY bid_amount ASC`,
      {
        replacements: { tenderId: tender_id },
      }
    );
    

    if (allBids.length === 0) {
      return res.status(404).json({
        msg: "No bids found for this tender.",
        success: false,
      });
    }

    // Filter the current user's bids
    const userBids = allBids.filter((bid) => bid.user_id === user_id);

    if (userBids.length === 0) {
      return res.status(404).json({
        msg: "No bids found for this buyer on the given tender.",
        success: false,
      });
    }

    // Get the user's latest bid (most recent by created_at)
    const latestUserBid = userBids.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const latestUserBidAmount = latestUserBid.bid_amount;

    // Check where the user's latest bid stands compared to others
    const rank = allBids
      .filter((bid) => bid.user_id !== user_id) // Exclude user's bids
      .reduce((currentRank, otherBid) => {
        if (otherBid.bid_amount < latestUserBidAmount) {
          currentRank++;
        }
        return currentRank;
      }, 1); // Start rank from 1

    // Determine the status based on rank
    const position = rank === 1 ? "L1" : "Not L1";

    // Respond with the bid details and status
    res.status(200).json({
      msg: "Bid comparison fetched successfully.",
      success: true,
      data: {
        tender_id,
        latestUserBid,
        position,
      },
    });
  } catch (error) {
    console.error("Error fetching bid comparison:", error.message);
    res.status(500).json({
      msg: "Error fetching bid comparison.",
      success: false,
      error: error.message,
    });
  }
});

export const getTenderBidsByTenderId = asyncErrorHandler(async (req, res) => {
  const { tender_id } = req.params; // Extract tender_id from request parameters

  try {
    // Step 1: Check if there are any bids for the specified tender
    const [checkTenderResult] = await db.sequelize.query(
      `SELECT 1 FROM tender_bid_room WHERE tender_id = :tenderId LIMIT 1`,
      {
        replacements: { tenderId: tender_id },
      }
    );

    if (checkTenderResult.length === 0) {
      console.log(
        `No records found in tender_bid_room for tender_id: ${tender_id}`
      );
      return res.status(404).json({
        success: false,
        msg: "No bids found for the selected tender",
      });
    }

    // Step 2: Fetch all bids for the specified tender, including user details
    const [bidsResult] = await db.sequelize.query(
      `
      SELECT 
        tbr.user_id,
        b.first_name,
        b.last_name,
        b.company_name,
        tbr.bid_amount
      FROM 
        tender_bid_room tbr
      INNER JOIN 
        buyer b ON tbr.user_id = b.user_id
      WHERE 
        tbr.tender_id = :tenderId
      ORDER BY 
        tbr.user_id, tbr.bid_amount DESC
      `,
      {
        replacements: { tenderId: tender_id },
      }
    );

    // If no bids are found, return 404
    if (bidsResult.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No bids found for the selected tender",
      });
    }

    // Step 3: Organize bids by user
    const bidsMap = bidsResult.reduce((acc, row) => {
      const { user_id, first_name, last_name, company_name, bid_amount } = row;

      if (!acc[user_id]) {
        acc[user_id] = {
          user_id,
          first_name,
          last_name,
          company_name,
          bid_amounts: [],
        };
      }

      acc[user_id].bid_amounts.push(bid_amount);
      return acc;
    }, {});

    // Convert the bids map to an array for the response
    const allBids = Object.values(bidsMap);

    // Success response
    res.status(200).json({
      success: true,
      msg: "Bids retrieved successfully",
      allBids,
    });
  } catch (error) {
    console.error("Error retrieving bids:", error.message);
    res.status(500).json({
      success: false,
      msg: "Error retrieving bids",
    });
  }
});

export const getTenderBids = asyncErrorHandler(async (req, res) => {
  const { tender_id } = req.params;
  const { user_id } = req.user;

  if (!tender_id) {
    return res
      .status(400)
      .json({ success: false, message: "Tender ID is required." });
  }

  try {
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
      WHERE mt.tender_id = :tenderId
    `;
    const [tenderDetailsResult] = await db.sequelize.query(tenderDetailsQuery, {
      replacements: { tenderId: tender_id },
    });

    if (!tenderDetailsResult.length) {
      return res
        .status(404)
        .json({ success: false, message: "Tender not found." });
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
      WHERE tender_id = :tenderId
      ORDER BY \`order\`
    `;
    const [headers] = await db.sequelize.query(headersQuery, {
      replacements: { tenderId: tender_id },
    });

    const filteredHeaders = headers.filter((header) => header.type === "view");
    const headerIds = filteredHeaders.map((header) => header.header_id);

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
      WHERE bhrd.header_id IN (:headerIds) AND bhrd.buyer_id = :userId
      ORDER BY bhrd.subtender_id ASC, bhrd.row_number ASC, bhrd.order ASC
    `;
    const [buyerHeaderData] = await db.sequelize.query(buyerHeaderDataQuery, {
      replacements: { headerIds, userId: user_id },
    });

    // Organize buyer data by subtender and row
    const buyerData = buyerHeaderData.reduce((acc, row) => {
      const { subtender_id, row_number, table_head, row_data } = row;

      if (!acc[subtender_id]) acc[subtender_id] = {};
      if (!acc[subtender_id][row_number]) acc[subtender_id][row_number] = {};
      if (!acc[subtender_id][row_number][table_head])
        acc[subtender_id][row_number][table_head] = [];

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
      WHERE s.tender_id = :tenderId
      ORDER BY s.subtender_id ASC, sh.row_number ASC, sh.order ASC;
    `;
    const [subtenderResults] = await db.sequelize.query(subtendersQuery, {
      replacements: { tenderId: tender_id },
    });

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
            const header = filteredHeaders.find(
              (h) => h.header_id === cell.header_id
            );
            if (header) {
              const tableHead = header.table_head;
              const buyerRowDataArray =
                buyerData[subtenderId]?.[rowIndex + 1]?.[tableHead] || [];
              if (buyerRowDataArray.length > 0) {
                subtender.rows[rowIndex][cellIndex].buyer_data =
                  buyerRowDataArray;
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
      WHERE tender_id = :tenderId AND user_id = :userId
      ORDER BY created_at DESC
    `;
    const [userBids] = await db.sequelize.query(userBidsQuery, {
      replacements: { tenderId: tender_id, userId: user_id },
    });

    res.status(200).json({
      success: true,
      message: "Tender bids and buyer data fetched successfully.",
      data: {
        tenderDetails,
        headers: filteredHeaders,
        sub_tenders: subtenderData,
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
