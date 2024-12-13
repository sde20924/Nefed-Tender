const db = require('../../config/config'); // Database configuration
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Async error handler middleware

// Controller to create a new tender
const createNewTenderController = asyncErrorHandler(async (req, res) => {
    const user_id = req.user.user_id; // Example user ID (modify as needed to fit your actual authentication logic

    // Destructuring form data from the request body
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
        extended_at = null,
        amt_of_ext,
        aut_auct_ext_bfr_end_time,
        min_decr_bid_val,
        timer_ext_val,
        qty_split_criteria,
        counter_offr_accept_timer,
        img_url,
        auction_type,
        tender_id,
        audi_key = null,
        auct_field, // Auction field data
    } = req.body;

    // Validation to ensure required fields are provided
    if (
        !tender_title || !tender_desc || !emd_amt || !emt_lvl_amt || !currency || !qty || !dest_port || !bag_size ||
        !bag_type || !measurement_unit || !app_start_time || !app_end_time || !auct_start_time || !auct_end_time ||
        !time_frame_ext || !amt_of_ext || !aut_auct_ext_bfr_end_time || !min_decr_bid_val || !timer_ext_val ||
        !qty_split_criteria || !counter_offr_accept_timer
    ) {
        return res.status(400).send({ msg: 'At least one field must be provided for the creation' });
    }

    try {
        // Check and parse stringified JSON values if necessary
        const parsedAttachments = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        const parsedCustomForm = typeof custom_form === 'string' ? JSON.parse(custom_form) : custom_form;
        const parsedAuctionField = typeof auct_field === 'string' ? JSON.parse(auct_field) : auct_field;

        // Begin a transaction
        await db.query('BEGIN');

        // Insert the new tender data into the manage_tender table (remove attachments)
        const newTender = await db.query(
            `INSERT INTO manage_tender (
                user_id, 
                tender_title, 
                tender_slug, 
                tender_desc, 
                tender_cat, 
                tender_opt, 
                emd_amt, 
                emt_lvl_amt, 
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
                tender_id, 
                audi_key
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) 
            RETURNING tender_id`,
            [
                user_id, 
                tender_title, 
                tender_slug, 
                tender_desc, 
                'testing',  
                tender_opt,
                emd_amt, 
                emt_lvl_amt, 
                parsedCustomForm, // Pass parsed JSON
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
                tender_id, 
                audi_key,
            ]
        );

        // Extract the new tender ID
        const createdTenderId = newTender.rows[0].tender_id;

        // Insert each attachment into the tender_required_doc table
        for (const attachment of parsedAttachments) {
            const { key, label, extension, maxFileSize } = attachment;
            await db.query(
                `INSERT INTO tender_required_doc (
                    tender_id, 
                    doc_key, 
                    doc_label, 
                    doc_ext, 
                    doc_size
                ) 
                VALUES ($1, $2, $3, $4, $5)`,
                [createdTenderId, key, label, extension, maxFileSize]
            );
        }

        // Insert auction field data into tender_auct_items table
        for (const auctionItem of parsedAuctionField) {
            const { name, quantity } = auctionItem;
            await db.query(
                `INSERT INTO tender_auct_items (
                    tender_id, 
                    auct_item, 
                    auct_qty ,
                ) 
                VALUES ($1, $2, $3)`,
                [createdTenderId, name, quantity]
            );
        }

        // Commit the transaction
        await db.query('COMMIT');

        // Return success response with the created tender ID
        return res.status(201).send({ msg: 'Tender created successfully', tender_id: createdTenderId });

    } catch (error) {
        // Rollback the transaction in case of error
        await db.query('ROLLBACK');
        console.error("Error creating tender:", error.message); // Log error for debugging
        return res.status(500).send({ msg: 'Error creating tender', error: error.message });
    }
});

module.exports = createNewTenderController;
