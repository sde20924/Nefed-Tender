const db = require('../../config/config'); // Database connection

const updateTenderDetails = async (req, res) => {
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
    // editable_sheet,
  } = req.body;

  try {
    const parsedAttachments =
      typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
    const parsedCustomForm =
      typeof custom_form === 'string' ? JSON.parse(custom_form) : custom_form;
    // const parsedEditableSheet =
    //   typeof editable_sheet === 'string' ? JSON.parse(editable_sheet) : editable_sheet;

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

    // // Handle `editable_sheet`: Update headers and sub-tenders
    // const { headers, sub_tenders } = parsedEditableSheet;

    // // Delete existing headers and re-insert updated ones
    // await db.query(`DELETE FROM tender_header WHERE tender_id = ?`, [tender_id]);
    // for (let i = 0; i < headers.length; i++) {
    //   const headerName = headers[i];
    //   await db.query(
    //     `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
    //     [tender_id, headerName, i + 1]
    //   );
    // }

    // // Delete existing sub-tenders and related rows, then re-insert updated ones
    // await db.query(`DELETE FROM subtender WHERE tender_id = ?`, [tender_id]);
    // await db.query(`DELETE FROM seller_header_row_data WHERE header_id = ?`, [tender_id]);
    // for (const subTender of sub_tenders) {
    //   const { name, rows } = subTender;

    //   // Insert subtender into `subtender` table
    //   const [subTenderResult] = await db.query(
    //     `INSERT INTO subtender (tender_id, subtender_name) VALUES (?, ?)`,
    //     [tender_id, name]
    //   );
    //   const subtenderId = subTenderResult.insertId; // Retrieve the inserted ID

    //   // Insert rows into `seller_header_row_data` table
    //   for (const row of rows) {
    //     await db.query(
    //       `INSERT INTO seller_header_row_data (header_id, row_data, subtender_id, seller_id)
    //        VALUES (?, ?, ?, ?)`,
    //       [tender_id, JSON.stringify(row), subtenderId, req.user.user_id] // Use subtenderId
    //     );
    //   }
    // }

    // Commit the transaction
    await db.query('COMMIT');

    // Retrieve the updated editable sheet for response
    // const headersQuery = `SELECT table_head FROM tender_header WHERE tender_id = ? ORDER BY \`order\``;
    // const subTendersQuery = `
    //   SELECT st.subtender_id, st.subtender_name, shrd.row_data
    //   FROM subtender st
    //   LEFT JOIN seller_header_row_data shrd ON st.subtender_id = shrd.subtender_id
    //   WHERE st.tender_id = ?
    // `;

    // const [headersResult] = await db.query(headersQuery, [tender_id]);
    // const [subTendersResult] = await db.query(subTendersQuery, [tender_id]);

    // // Format the editable sheet response
    // const formattedEditableSheet = {
    //   headers: headersResult.map(header => header.table_head),
    //   sub_tenders: subTendersResult.reduce((acc, curr) => {
    //     const existingSubTender = acc.find(sub => sub.name === curr.subtender_name);
    //     if (existingSubTender) {
    //       existingSubTender.rows.push(JSON.parse(curr.row_data));
    //     } else {
    //       acc.push({
    //         name: curr.subtender_name,
    //         rows: curr.row_data ? [JSON.parse(curr.row_data)] : [],
    //       });
    //     }
    //     return acc;
    //   }, []),
    // };

    res.status(200).send({
      msg: 'Tender updated successfully',
      tender_id,
    //   editable_sheet: formattedEditableSheet,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating tender:', error.message);
    res.status(500).json({ success: false, msg: 'Failed to update tender', error: error.message });
  }
};

module.exports = updateTenderDetails;
