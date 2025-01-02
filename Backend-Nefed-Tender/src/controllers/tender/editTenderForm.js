import db from '../../config/config2.js'; // Database connection
import asyncErrorHandler from '../../utils/asyncErrorHandler.js'; // Async error handler middleware

/**
 * Controller to update tender details.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const updateTenderDetails = asyncErrorHandler(async (req, res) => {
  const { id: tender_id } = req.params; // Extract tender ID from URL parameters
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
    headers = [],
    sub_tender = [],
  } = req.body;

  try {
    // Parse attachments and custom_form
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
      tender_title,
      tender_slug,
      tender_desc,
      tender_cat,
      tender_opt,
      emd_amt,
      emt_lvl_amt,
      JSON.stringify(parsedCustomForm),
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
      extended_at,
      amt_of_ext,
      aut_auct_ext_bfr_end_time,
      min_decr_bid_val,
      timer_ext_val,
      qty_split_criteria,
      counter_offr_accept_timer,
      img_url,
      auction_type,
      audi_key,
      tender_id,
    ];
    await db.query(updateTenderQuery, tenderValues);

    // Handle `attachments`
    await db.query(`DELETE FROM tender_required_doc WHERE tender_id = ?`, [tender_id]);
    for (const attachment of parsedAttachments) {
      const { key, label, extension, maxFileSize } = attachment;
      await db.query(
        `INSERT INTO tender_required_doc (tender_id, doc_key, doc_label, doc_ext, doc_size) VALUES (?, ?, ?, ?, ?)`,
        [tender_id, key, label, extension, maxFileSize]
      );
    }

    // Handle `headers`
    await db.query(`DELETE FROM tender_header WHERE tender_id = ?`, [tender_id]);
    for (const { table_head, order } of headers) {
      await db.query(
        `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
        [tender_id, table_head, order]
      );
    }

    // Handle `sub_tender`
    await db.query(`DELETE FROM subtender WHERE tender_id = ?`, [tender_id]);
    for (const { name, rows } of sub_tender) {
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
              type || (data ? 'view' : 'edit'),
              rowIndex + 1,
            ]
          );
        }
      }
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(200).json({ success: true, msg: 'Tender updated successfully', tender_id });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating tender:', error.message);
    res.status(500).json({ success: false, msg: 'Failed to update tender', error: error.message });
  }
});
