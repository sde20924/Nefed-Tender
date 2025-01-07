const db = require("../../config/config");
const axios = require("axios");
const { userVerifyApi } = require("../../utils/external/api");

const getAllAuctionBids = async (req, res) => {
  try {
    const { tender_id } = req.params;

    if (!tender_id) {
      return res
        .status(400)
        .json({ success: false, message: "Tender ID is required." });
    }
    // Fetch headers
    const headersQuery = `
      SELECT 
          header_id, 
          table_head, 
          \`order\`
      FROM tender_header
      WHERE tender_id = ?
      ORDER BY \`order\`
    `;
    const [headers] = await db.query(headersQuery, [tender_id]);
    console.log("-=-=-=-=-=yha aa tk aa rha h")

    // Fetch subtenders and rows (including buyer and seller data)
    const subtendersQuery = `
      SELECT 
    s.subtender_id,
    s.subtender_name,
    sh.header_id AS seller_header_id,
    sh.row_data AS seller_row_data,
    sh.type AS seller_type,
    sh.order AS seller_order,
    sh.row_number AS seller_row_number,
    bh.header_id AS buyer_header_id,
    bh.row_data AS buyer_row_data,
    bh.buyer_id AS buyer_id,
    bh.row_number AS buyer_row_number,
    bh.order AS buyer_order
FROM subtender s
LEFT JOIN seller_header_row_data sh 
    ON s.subtender_id = sh.subtender_id
LEFT JOIN buyer_header_row_data bh 
    ON s.subtender_id = bh.subtender_id 
    AND sh.header_id = bh.header_id 
    AND sh.row_number = bh.row_number 
    AND sh.order = bh.order
    AND bh.row_data_id = (
        SELECT MAX(row_data_id) 
        FROM buyer_header_row_data 
        WHERE subtender_id = s.subtender_id 
        AND row_number = sh.row_number
        AND header_id=sh.header_id
        AND buyer_id=bh.buyer_id
    )
WHERE s.tender_id = ?
ORDER BY s.subtender_id, sh.row_number, sh.order;
    `;
    const [subtenderResults] = await db.query(subtendersQuery, [tender_id]);
console.log("-=-=-=-=-=-=subtenderResults",subtenderResults)
    const subtenderData = {};
    const buyerDataMap = new Map();
    const headersChangedByBuyers = [];
    const buyerSpecificHeaders = new Set();

    subtenderResults.forEach((row) => {
      const {
        subtender_id,
        subtender_name,
        buyer_id,
        seller_header_id,
        seller_row_data,
        seller_row_number,
        seller_order,
        seller_type,
        buyer_header_id,
        buyer_row_data,
        buyer_row_number,
        buyer_order,
      } = row;

      // Organize data for all subtenders
      if (!subtenderData[subtender_id]) {
        subtenderData[subtender_id] = {
          id: subtender_id,
          name: subtender_name,
          rows: [],
        };
      }

      const subtender = subtenderData[subtender_id];

      if (!subtender.rows[seller_row_number - 1]) {
        subtender.rows[seller_row_number - 1] = [];
      }
      if (seller_type !== "edit") {
        const rowData = {
          header_id: seller_header_id,
          row_data: seller_row_data || "",
          type: seller_type || "view",
          buyer_id: "view",
          row_number: seller_row_number,
          order: seller_order,
        };

        subtender.rows[seller_row_number - 1][seller_order - 1] = rowData;
      }

      // Exclude headers present in buyer_header_row_data
      if (buyer_row_data !== null) {
        buyerSpecificHeaders.add(buyer_header_id);

        // Track headers changed by buyers
        const existingEntry = headersChangedByBuyers.find(
          (entry) =>
            entry.header_id === buyer_header_id && entry.buyer_id === buyer_id
        );

        if (!existingEntry) {
          headersChangedByBuyers.push({
            header_id: buyer_header_id,
            header_name:
              headers.find((header) => header.header_id === buyer_header_id)
                ?.table_head || "",
            buyer_id: buyer_id,
            buyer_name: `Buyer ${buyer_id}`, // Placeholder, replace with actual buyer name if available
          });
        }
      } else {
        // Only add seller data for headers not present in `headersChangedByBuyers`
        const isHeaderChangedByBuyer = headersChangedByBuyers.some(
          (entry) => entry.header_id === seller_header_id
        );

        if (!isHeaderChangedByBuyer) {
          const rowData = {
            header_id: seller_header_id,
            row_data: seller_row_data || "",
            type: seller_type || "view",
            buyer_id: "view",
            row_number: seller_row_number,
            order: seller_order,
          };

          subtender.rows[seller_row_number - 1][seller_order - 1] = rowData;
        }
      }

      // Organize buyer-specific data
      if (buyer_id) {
        if (!buyerDataMap.has(buyer_id)) {
          buyerDataMap.set(buyer_id, {});
        }

        const buyerData = buyerDataMap.get(buyer_id);

        if (!buyerData[subtender_id]) {
          buyerData[subtender_id] = {
            id: subtender_id,
            name: subtender_name,
            rows: [],
          };
        }

        const buyerSubtender = buyerData[subtender_id];

        if (!buyerSubtender.rows[buyer_row_number - 1]) {
          buyerSubtender.rows[buyer_row_number - 1] = [];
        }

        buyerSubtender.rows[buyer_row_number - 1][buyer_order - 1] = {
          header_id: buyer_header_id,
          row_data: buyer_row_data,
          type: "edit",
          buyer_id,
          row_number: buyer_row_number,
          order: buyer_order,
        };
      }
    });

    const buyerDataObject = Object.fromEntries(buyerDataMap);

    // Group headersChangedByBuyers by buyer_id and buyer_name
    const groupedHeadersByBuyers = headersChangedByBuyers.reduce((acc, curr) => {
      const { buyer_id, buyer_name } = curr;
      if (!acc[buyer_id]) {
        acc[buyer_id] = {
          buyer_id,
          buyer_name,
          headers: [],
        };
      }
      acc[buyer_id].headers.push(curr);
      return acc;
    }, {});

    // Filter out headers present in buyer_header_row_data
    const filteredHeaders = headers.filter(
      (header) => !buyerSpecificHeaders.has(header.header_id)
    );

    // **Modified Bids Query to Fetch Latest Bid per User**
    const bidsQuery = `
      SELECT 
          tbr.bid_id,
          tbr.user_id,
          tbr.tender_id,
          tbr.bid_amount,
          tbr.status AS bid_status,
          tbr.created_at,
          mt.auct_start_time,
          mt.auct_end_time
 
      FROM 
          tender_bid_room tbr 
      INNER JOIN (
          SELECT 
              user_id, 
              MAX(created_at) AS latest_created_at
          FROM 
              tender_bid_room
          WHERE 
              tender_id = ?
          GROUP BY 
              user_id
      ) lb ON tbr.user_id = lb.user_id AND tbr.created_at = lb.latest_created_at
      INNER JOIN 
          manage_tender mt ON tbr.tender_id = mt.tender_id
      WHERE 
          tbr.tender_id = ?;
    `;
    const [bids] = await db.query(bidsQuery, [tender_id, tender_id]);

    const userIds = bids.map((bid) => bid.user_id);
    const externalApiPayload = {
      required_keys:
        "first_name,last_name,gst_number,user_id,email,phone_number,company_name",
      user_ids: userIds.map((user_id) => ({ type: "buyer", user_id })),
    };
    const token = req.headers["authorization"];
    const externalApiEndpoint = `${userVerifyApi}taqw-yvsu`;

    const externalApiResponse = await axios.post(
      externalApiEndpoint,
      externalApiPayload,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const userDetails = externalApiResponse.data;
    const allBidsWithUserDetails = bids.map((bid) => {
      const userDetail = userDetails.data.find(
        (user) => user.user_id === bid.user_id
      );
      return {
        ...bid,
        user_details: userDetail || {}, // Attach user details if available
      };
    });

    Object.values(groupedHeadersByBuyers).forEach((header) => {
      const userDetail = userDetails.data.find(
        (user) => user.user_id === header.buyer_id
      );
      if (userDetail) {
        header.buyer_name = `${userDetail.first_name} ${userDetail.last_name}`;
      }
    });

    // Success response
    res.status(200).json({
      success: true,
      data: {
        tenderDetails: {
          tender_title: tender_id,
          headers: filteredHeaders,
          sub_tenders: subtenderData,
        },
        headersChangedByBuyers: groupedHeadersByBuyers,
        subTendersByBuyer: buyerDataObject,
        allBids: allBidsWithUserDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { getAllAuctionBids };
