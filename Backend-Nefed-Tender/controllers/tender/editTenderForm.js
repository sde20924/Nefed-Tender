const db = require('../../config/config'); // Database connection
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Async error handler middleware

const updateTenderDetails = asyncErrorHandler(async (req, res) => {
    const { id: tender_id } = req.params;
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
        dest_port,
        bag_size,
        bag_type,
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
        audi_key = null,
        headers,
        sub_tender, // Changed from sub_tenders to sub_tender
    } = req.body;

    try {
        // Parse attachments and custom_form if needed
        const parsedAttachments =
            typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        const parsedCustomForm =
            typeof custom_form === 'string' ? JSON.parse(custom_form) : custom_form;

        // Begin a transaction
        await db.query('START TRANSACTION');

        // Update `manage_tender` table
        const updateTenderQuery = `
            UPDATE manage_tender
            SET 
                tender_title = ?, tender_slug = ?, tender_desc = ?, tender_cat = ?, tender_opt = ?, 
                emd_amt = ?, emt_lvl_amt = ?, custom_form = ?, currency = ?, start_price = ?, 
                dest_port = ?, bag_size = ?, bag_type = ?, app_start_time = ?, app_end_time = ?, 
                auct_start_time = ?, auct_end_time = ?, time_frame_ext = ?, extended_at = ?, 
                amt_of_ext = ?, aut_auct_ext_bfr_end_time = ?, min_decr_bid_val = ?, timer_ext_val = ?, 
                qty_split_criteria = ?, counter_offr_accept_timer = ?, img_url = ?, auction_type = ?, audi_key = ?
            WHERE tender_id = ?
        `;
        const tenderValues = [
            tender_title, tender_slug, tender_desc, tender_cat, tender_opt,
            emd_amt, emt_lvl_amt, JSON.stringify(parsedCustomForm), currency, start_price,
            dest_port, bag_size, bag_type, app_start_time, app_end_time,
            auct_start_time, auct_end_time, time_frame_ext, extended_at,
            amt_of_ext, aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
            qty_split_criteria, counter_offr_accept_timer, img_url, auction_type, audi_key,
            tender_id, // WHERE clause
        ];
        await db.query(updateTenderQuery, tenderValues);

        // Delete existing attachments and re-insert updated ones
        await db.query(`DELETE FROM tender_required_doc WHERE tender_id = ?`, [tender_id]);
        for (const attachment of parsedAttachments) {
            const { key, label, extension, maxFileSize } = attachment;
            await db.query(
                `INSERT INTO tender_required_doc (tender_id, doc_key, doc_label, doc_ext, doc_size)
                 VALUES (?, ?, ?, ?, ?)`,
                [tender_id, key, label, extension, maxFileSize]
            );
        }

        // Update `headers` in `tender_header`
        await db.query(`DELETE FROM tender_header WHERE tender_id = ?`, [tender_id]);
        for (const { header_id, table_head, order } of headers) {
            await db.query(
                `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
                [tender_id, table_head, order]
            );
        }

        // Update `sub_tender` in `subtender` and related rows in `seller_header_row_data`
        await db.query(`DELETE FROM subtender WHERE tender_id = ?`, [tender_id]);
        for (const { id, name, rows } of sub_tender) {
            const [newSubTender] = await db.query(
                `INSERT INTO subtender (tender_id, subtender_name) VALUES (?, ?)`,
                [tender_id, name]
            );
            const subtenderId = newSubTender.insertId;

            for (const [rowIndex, row] of rows.entries()) {
                for (const [cellIndex, cell] of row.entries()) {
                    const { data, type } = cell;
                    const header_id = headers[cellIndex].header_id;

                    await db.query(
                        `INSERT INTO seller_header_row_data (header_id, row_data, subtender_id, seller_id, \`order\`, type, row_number)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            header_id,
                            data || '',
                            subtenderId,
                            req.user.user_id,
                            cellIndex + 1,
                            cell === "" || cell === null ? "edit" : "view",
                            rowIndex + 1,
                        ]
                    );
                }
            }
        }

        // Commit the transaction
        await db.query('COMMIT');

        res.status(200).send({
            msg: 'Tender updated successfully',
            tender_id,
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error updating tender:', error.message);
        res.status(500).json({ success: false, msg: 'Failed to update tender', error: error.message });
    }
});

module.exports = updateTenderDetails;
