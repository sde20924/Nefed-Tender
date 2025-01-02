const db = require("../../config/config");
const axios = require("axios");
const { userVerifyApi } = require("../../utils/external/api");
const getAllAuctionBids = async (req, res) => {
    try {
        const { tender_id } = req.params;
        console.log("+++++++",tender_id)
        // Early return if tender_id is not provided or invalid
        if (!tender_id) {
            return res.status(400).json({ success: false, message: "Tender ID is required." });
        }
         
        // Modified query to get all details for users with their lowest bid amount, including additional fields from manage_tender
        const query = `
            SELECT 
                tbr.bid_id,
                tbr.user_id,
                tbr.tender_id,
                tbr.bid_amount,
                tbr.status AS bid_status,  -- using alias to avoid conflict
                tbr.created_at,
                mt.auct_start_time,
                mt.auct_end_time,
                mt.emd_amt
            FROM 
                tender_bid_room tbr
            INNER JOIN (
                SELECT 
                    user_id, 
                    MIN(bid_amount) AS lowest_bid_amount
                FROM 
                    tender_bid_room
                WHERE 
                    tender_id = ?
                GROUP BY 
                    user_id
            ) lb ON tbr.user_id = lb.user_id AND tbr.bid_amount = lb.lowest_bid_amount
          
            INNER JOIN 
                manage_tender mt ON tbr.tender_id = mt.tender_id
            WHERE 
                tbr.tender_id = ?;
        `;
        const values = [tender_id, tender_id];
        const [result] = await db.query(query, values);
         console.log("result+++++",result)
        // Handle no results found
        // if (result.length === 0) {
        //     return res.status(404).json({ success: false, message: "No bids found for this tender." });
        // }
        
        // Success response
        // res.status(200).json({ success: true, allBids: result });
        const userIds = result.map((row) => row.user_id);
        console.log("========",userIds)
        const externalApiPayload = {
            required_keys:
              "first_name,last_name,gst_number,user_id,email,phone_number,company_name",
            user_ids: userIds.map((user_id) => ({ type: "buyer", user_id })),
          };
          const token = req.headers["authorization"];
          console.log("TOKEN++++",token) // Authorization token from the request header
          const externalApiEndpoint = `${userVerifyApi}taqw-yvsu`;
           // Call the external API to fetch user details
         const externalApiResponse = await axios.post(
        externalApiEndpoint,
        externalApiPayload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

       // Combine user details from the API response with the bid data
    let userDetails = externalApiResponse.data;
    console.log(userDetails)
    const allBidsWithUserDetails = result.map((bid) => {
      let userDetail = userDetails.data.find((user) => user.user_id === bid.user_id);
      return {
        ...bid,
        user_details: userDetail || {}, // Attach user details if available
      };
    });
    console.log("us")

    // Success response
    res.status(200).json({ success: true, allBids: allBidsWithUserDetails });
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

module.exports = { getAllAuctionBids };
