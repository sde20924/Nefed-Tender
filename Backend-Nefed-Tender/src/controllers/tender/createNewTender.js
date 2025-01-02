import db from "../../config/config2.js";
import asyncErrorHandler from "../../utils/asyncErrorHandler.js";

/**
 * Controller to create a new tender.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const createNewTenderController = asyncErrorHandler(async (req, res) => {
  const user_id = req.user.user_id; // Extract authenticated user ID from middleware
  const {
    tender_title,
    tender_slug,
    tender_desc,
    tender_cat = "testing",
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
    accessType,
    tender_id,
    audi_key = null,
    editable_sheet,
    selected_buyers = [],
  } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!tender_title) missingFields.push("tender_title");
  if (!emd_amt) missingFields.push("emd_amt");
  if (!emt_lvl_amt) missingFields.push("emt_lvl_amt");
  if (!currency) missingFields.push("currency");
  if (!app_start_time) missingFields.push("app_start_time");
  if (!app_end_time) missingFields.push("app_end_time");
  if (!auct_start_time) missingFields.push("auct_start_time");
  if (!auct_end_time) missingFields.push("auct_end_time");
  if (!time_frame_ext) missingFields.push("time_frame_ext");
  if (!amt_of_ext) missingFields.push("amt_of_ext");
  if (!aut_auct_ext_bfr_end_time) missingFields.push("aut_auct_ext_bfr_end_time");
  if (!min_decr_bid_val) missingFields.push("min_decr_bid_val");
  if (!timer_ext_val) missingFields.push("timer_ext_val");
  if (!qty_split_criteria) missingFields.push("qty_split_criteria");
  if (!counter_offr_accept_timer) missingFields.push("counter_offr_accept_timer");

  if (missingFields.length > 0) {
    return res.status(400).json({
      msg: "Required fields are missing for tender creation.",
      missingFields,
    });
  }

  try {
    console.log("Selected buyers:", selected_buyers);

    const parsedAttachments =
      typeof attachments === "string" ? JSON.parse(attachments) : attachments;
    const parsedCustomForm =
      typeof custom_form === "string" ? JSON.parse(custom_form) : custom_form;

    // Begin transaction
    await db.query("START TRANSACTION");

    // Insert new tender
    const [newTender] = await db.query(
      `INSERT INTO manage_tender (
        user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt,
        emd_amt, emt_lvl_amt, custom_form, currency, start_price, dest_port,
        bag_size, bag_type, app_start_time, app_end_time,
        auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext,
        aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
        qty_split_criteria, counter_offr_accept_timer, img_url, auction_type,
        tender_id, audi_key, user_access
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
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
        tender_id,
        audi_key,
        accessType,
      ]
    );

    // Insert attachments into `tender_required_doc`
    for (const attachment of parsedAttachments) {
      const { key, label, extension, maxFileSize } = attachment;
      await db.query(
        `INSERT INTO tender_required_doc (tender_id, doc_key, doc_label, doc_ext, doc_size)
         VALUES (?, ?, ?, ?, ?)`,
        [tender_id, key, label, extension, maxFileSize]
      );
    }

    // Handle editable sheet headers and rows
    const { headers, sub_tenders } = editable_sheet;
    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      const [headerResult] = await db.query(
        `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
        [tender_id, headerName, i + 1]
      );
      const headerId = headerResult.insertId;

      for (const subTender of sub_tenders) {
        const { name, rows } = subTender;

        let [subTenderResult] = await db.query(
          `SELECT subtender_id FROM subtender WHERE subtender_name = ? AND tender_id = ?`,
          [name, tender_id]
        );

        let subtenderId = subTenderResult.length
          ? subTenderResult[0].subtender_id
          : (
              await db.query(
                `INSERT INTO subtender (subtender_name, tender_id) VALUES (?, ?)`,
                [name, tender_id]
              )
            )[0].insertId;

        for (const [rowIndex, row] of rows.entries()) {
          for (let j = 0; j < row.length; j++) {
            const cellData = row[j];
            await db.query(
              `INSERT INTO seller_header_row_data (
                header_id, row_data, subtender_id, seller_id, \`order\`, type, row_number
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                headerId,
                cellData,
                subtenderId,
                user_id,
                j + 1,
                cellData === "" || cellData === null ? "edit" : "view",
                rowIndex + 1,
              ]
            );
          }
        }
      }
    }

    // Insert selected buyers if access type is private
    if (accessType === "private" && Array.isArray(selected_buyers)) {
      for (const buyer_id of selected_buyers) {
        await db.query(
          `INSERT INTO tender_access (buyer_id, tender_id) VALUES (?, ?)`,
          [buyer_id, tender_id]
        );
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    res.status(201).json({ msg: "Tender created successfully", tender_id });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error creating tender:", error);
    res.status(500).json({ msg: "Error creating tender", error: error.message });
  }
});
