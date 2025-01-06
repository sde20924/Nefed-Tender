const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handling middleware
const { userVerifyApi } = require("../../utils/external/api");
const axios = require("axios");

const getBuyerList = asyncErrorHandler(async (req, res) => {
  // Query to fetch the buyer list
  const query = `
    SELECT user_id, first_name, last_name, email, phone_number, created_on 
    FROM buyer
  `;

  try {
    // Execute the query and get the result
    const [rows] = await db.execute(query); // Using `execute` for parameterized queries
    // Respond with the fetched data
    res.status(200).json({ buyerData: rows, success: true });
  } catch (error) {
    console.error("Error fetching buyer list:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch buyer list",
      error: error.message,
    });
  }
});

const getSellerBuyerList = asyncErrorHandler(async (req, res) => {
  const { demo_tender_sheet_id } = req.body;

  const query = `
    SELECT seller_buyer_id, seller_id, buyer_id, createdAt, demo_tender_sheet_id
    FROM seller_buyer WHERE 1 
    ${demo_tender_sheet_id ? "AND demo_tender_sheet_id = ?" : ""}
  `;

  try {
    const token = req.headers["authorization"];

    const [rows] = await db.execute(
      query,
      demo_tender_sheet_id ? [demo_tender_sheet_id] : []
    );

    const sellerBuyerData = rows;

    const user_ids = sellerBuyerData.map((buyer) => {
      return {
        type: "buyer",
        user_id: buyer.buyer_id,
      };
    });

    const buyerDetailsResponse = await axios.post(
      userVerifyApi + "taqw-yvsu",
      {
        required_keys: "*",
        user_ids: user_ids,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const buyerDetails = buyerDetailsResponse.data;

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

module.exports = { getBuyerList, getSellerBuyerList };
