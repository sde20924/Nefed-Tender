const db = require("../../config/config"); 
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Async error handler middleware

// Controller to create a new tender
const createNewTenderController = asyncErrorHandler(async (req, res) => {
  const user_id = req.user.user_id;
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
    tender_id,
    audi_key = null,
    editable_sheet, 
  } = req.body;
  // Validation to ensure required fields are provided
  const missingFields = [];
  if (!tender_title) missingFields.push("tender_title");
  if (!emd_amt) missingFields.push("emd_amt");
  if (!emt_lvl_amt) missingFields.push("emt_lvl_amt");
  if (!currency) missingFields.push("currency");
  if (!dest_port) missingFields.push("dest_port");
  if (!bag_size) missingFields.push("bag_size");
  if (!bag_type) missingFields.push("bag_type");
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
    return res.status(400).send({
      msg: "Required fields are missing for tender creation.",
      missingFields,
    });
  }
  try {
    const parsedAttachments =
      typeof attachments === "string" ? JSON.parse(attachments) : attachments;
    const parsedCustomForm =
      typeof custom_form === "string" ? JSON.parse(custom_form) : custom_form;

    // Begin a transaction
    await db.query("START TRANSACTION");

    // Insert the new tender data into the `manage_tender` table
    const [newTender] = await db.query(
        `INSERT INTO manage_tender (
          user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt,
          emd_amt, emt_lvl_amt, custom_form, currency, start_price, dest_port,
          bag_size, bag_type, app_start_time, app_end_time,
          auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext,
          aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
          qty_split_criteria, counter_offr_accept_timer, img_url, auction_type,
          tender_id, audi_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Match the column count
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
        ]
    );

    const createdTenderId = newTender.insertId;

    // Insert attachments into `tender_required_doc`
    for (const attachment of parsedAttachments) {
      const { key, label, extension, maxFileSize } = attachment;
      await db.query(
        `INSERT INTO tender_required_doc (tender_id, doc_key, doc_label, doc_ext, doc_size)
         VALUES (?, ?, ?, ?, ?)`,
        [createdTenderId, key, label, extension, maxFileSize]
      );
    }

    // Handle `editable_sheet`: Insert headers and sub-tenders
    const { headers, sub_tenders } = editable_sheet;

    // Insert headers into `tender_header` table
    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      await db.query(
        `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
        [createdTenderId, headerName, i + 1]
      );
    }

    // Insert sub-tenders and their rows into `subtender` and `seller_header_row_data`
    for (const subTender of sub_tenders) {
      const { name, rows } = subTender;

      // Insert subtender into `subtender` table
      const [subTenderResult] = await db.query(
        `INSERT INTO subtender (subtender_name) VALUES (?)`,
        [name]
      );
      const subtenderId = subTenderResult.insertId; // Correctly retrieve the inserted ID

      // Insert rows into `seller_header_row_data` table
      for (const row of rows) {
        await db.query(
          `INSERT INTO seller_header_row_data (header_id, row_data, subtender_id, seller_id)
           VALUES (?, ?, ?, ?)`,
          [createdTenderId, JSON.stringify(row), subtenderId, user_id] // Use the retrieved subtenderId
        );
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    res.status(201).send({ msg: "Tender created successfully", tender_id: createdTenderId });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error creating tender:", error.message);
    res.status(500).send({ msg: "Error creating tender", error: error.message });
  }
});

module.exports = createNewTenderController;
