const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware
const { v4: uuidv4 } = require('uuid'); // UUID for generating a unique tender ID

// Function to generate a unique Tender ID
const generateTenderId = () => {
    return uuidv4(); // Generates a universally unique identifier (UUID)
};

// Controller to clone a tender for the specific seller
const cloneTenderController = asyncErrorHandler(async (req, res) => {
    const { id } = req.params; // Tender ID that needs to be cloned
    const sellerId = req.user.user_id; // Assuming the user ID is correctly set in the middleware

    try {
        // Query to find the tender to be cloned, making sure it belongs to the seller
        const tenderQuery = `SELECT * FROM manage_tender WHERE tender_id = $1 AND user_id = $2`;
        const { rows: tenderToClone } = await db.query(tenderQuery, [id, sellerId]);

        if (tenderToClone.length === 0) {
            return res.status(404).json({ success: false, msg: "Tender not found or not authorized" });
        }

        const tender = tenderToClone[0];
        const newTenderId = generateTenderId(); // Generate a new tender ID
        const newTitle = `${tender.tender_title.trim()} - Clone`;

        // Clone the tender and insert it into the manage_tender table
        const cloneQuery = `
            INSERT INTO manage_tender (
                tender_id, user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt, emd_amt, emt_lvl_amt,
                currency, start_price, qty, dest_port, bag_size, bag_type, measurement_unit, app_start_time, app_end_time,
                auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext, aut_auct_ext_bfr_end_time, 
                min_decr_bid_val, timer_ext_val, qty_split_criteria, counter_offr_accept_timer, img_url, auction_type, audi_key
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 
                $24, $25, $26, $27, $28, $29, $30, $31
            ) RETURNING tender_id;
        `;
        
        // Set values for the new tender, keeping the same data but with a new ID and updated title
        const values = [
            newTenderId, sellerId, newTitle, tender.tender_slug, tender.tender_desc, tender.tender_cat, tender.tender_opt,
            tender.emd_amt, tender.emt_lvl_amt, tender.currency, tender.start_price, tender.qty, tender.dest_port, tender.bag_size,
            tender.bag_type, tender.measurement_unit, tender.app_start_time, tender.app_end_time, tender.auct_start_time,
            tender.auct_end_time, tender.time_frame_ext, tender.extended_at, tender.amt_of_ext, tender.aut_auct_ext_bfr_end_time,
            tender.min_decr_bid_val, tender.timer_ext_val, tender.qty_split_criteria, tender.counter_offr_accept_timer,
            tender.img_url, tender.auction_type, tender.audi_key
        ];
        
        const clonedTender = await db.query(cloneQuery, values);
        
        // Return success response with the new tender ID
        res.status(201).json({ success: true, msg: 'Tender cloned successfully', clonedId: clonedTender.rows[0].tender_id });
    } catch (error) {
        console.error('Error cloning tender:', error);
        res.status(500).json({ success: false, msg: 'Failed to clone tender', error: error.message });
    }
});

module.exports = {
    cloneTenderController,
};
