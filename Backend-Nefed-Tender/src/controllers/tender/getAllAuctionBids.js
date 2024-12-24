const db = require("../../config/config");

const getAllAuctionBids = async (req, res) => {
    try {
        const { tender_id } = req.params;

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
                tbr.fob_amount,
                tbr.freight_amount,
                tbr.round,
                tbr.qty_secured,
                tbr.status AS bid_status,  -- using alias to avoid conflict
                tbr.created_at,
                b.first_name,
                b.last_name,
                b.company_name,
                b.phone_number,
                b.email,
                b.user_id,
                mt.dest_port,
                mt.auct_start_time,
                mt.auct_end_time,
                mt.qty,
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
                    tender_id = $1
                GROUP BY 
                    user_id
            ) lb ON tbr.user_id = lb.user_id AND tbr.bid_amount = lb.lowest_bid_amount
            INNER JOIN 
                buyer b ON tbr.user_id = b.user_id
            INNER JOIN 
                manage_tender mt ON tbr.tender_id = mt.tender_id
            WHERE 
                tbr.tender_id = $1;
        `;
        const values = [tender_id];
        const result = await db.query(query, values);

        // Handle no results found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No bids found for this tender." });
        }

        // Success response
        res.status(200).json({ success: true, allBids: result.rows });
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

module.exports = { getAllAuctionBids };
