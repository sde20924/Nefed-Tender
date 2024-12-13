const db = require('../../config/config');  

const updateTenderDetails = async (req, res) => {
    const { id } = req.params;
    const {
        tender_title,
        tender_slug,
        tender_desc,
        tender_cat = 'testing',
        tender_opt,
        emd_amt,
        emt_lvl_amt,
        attachments,
        custom_form,
        currency,
        start_price,
        qty,
        dest_port,
        bag_size,
        bag_type,
        measurement_unit,
        app_start_time,
        app_end_time,
        auct_start_time,
        auct_end_time,
        time_frame_ext,
        extended_at,
        amt_of_ext,
        aut_auct_ext_bfr_end_time,
        min_decr_bid_val,
        timer_ext_val,
        qty_split_criteria,
        counter_offr_accept_timer,
        img_url,
        auction_type,
        audi_key
    } = req.body;

    console.log("Received start_price:", start_price);
    console.log("Received qty:", qty);
    console.log("Received emd_amt:", emd_amt);

    try {
        const sql = `
            UPDATE manage_tender
            SET 
                tender_title = $1,
                tender_slug = $2,
                tender_desc = $3,
                tender_cat = $4,
                tender_opt = $5,
                emd_amt = $6,
                emt_lvl_amt = $7,
                custom_form = $8,
                currency = $9,
                start_price = $10,
                qty = $11,
                dest_port = $12,
                bag_size = $13,
                bag_type = $14,
                measurement_unit = $15,
                app_start_time = $16,
                app_end_time = $17,
                auct_start_time = $18,
                auct_end_time = $19,
                time_frame_ext = $20,
                extended_at = $21,
                amt_of_ext = $22,
                aut_auct_ext_bfr_end_time = $23,
                min_decr_bid_val = $24,
                timer_ext_val = $25,
                qty_split_criteria = $26,
                counter_offr_accept_timer = $27,
                img_url = $28,
                auction_type = $29,
                audi_key = $30
            WHERE tender_id = $31
        `;
        const values = [
            tender_title, tender_slug, tender_desc, tender_cat, tender_opt,
            emd_amt, emt_lvl_amt, JSON.stringify(custom_form), currency, start_price,
            qty, dest_port, bag_size, bag_type, measurement_unit,
            app_start_time, app_end_time, auct_start_time, auct_end_time, time_frame_ext,
            extended_at, amt_of_ext, aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
            qty_split_criteria, counter_offr_accept_timer, img_url, auction_type, audi_key, 
            id  // This is the tender_id used for the WHERE clause
        ];
        
        const result = await db.query(sql, values);
        res.status(200).json({ success: true, msg: 'Tender updated successfully', data: result });
    } catch (error) {
        console.error('Error updating tender:', error);
        res.status(500).json({ success: false, msg: 'Failed to update tender', error: error.message });
    }
};

module.exports = updateTenderDetails;
