const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Async error handler middleware
const { emitEvent } = require("../../socket/event/emit");
const { userVerifyApi } = require("../../utils/external/api");
const axios = require("axios");

// Controller to create a new tender
const createNewTenderController = asyncErrorHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const {
    tender_title,
    tender_slug,
    tender_desc,
    tender_cat = "testing",
    tender_opt,
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
    accessPosition,
    formula,
    save_as,
    ShowItems
, 
    category
  } = req.body;
  console.log("+++++++++++++++++------", req.body);
  // Validation to ensure required fields are provided
  const missingFields = [];
  if (!tender_title) missingFields.push("tender_title");
  // if (!emd_amt) missingFields.push("emd_amt");
  // if (!emt_lvl_amt) missingFields.push("emt_lvl_amt");
  if (!currency) missingFields.push("currency");
  // if (!dest_port) missingFields.push("dest_port");
  // if (!bag_size) missingFields.push("bag_size");
  // if (!bag_type) missingFields.push("bag_type");
  if (!app_start_time) missingFields.push("app_start_time");
  if (!app_end_time) missingFields.push("app_end_time");
  if (!auct_start_time) missingFields.push("auct_start_time");
  if (!auct_end_time) missingFields.push("auct_end_time");
  if (!time_frame_ext) missingFields.push("time_frame_ext");
  if (!amt_of_ext) missingFields.push("amt_of_ext");
  if (!aut_auct_ext_bfr_end_time)
    missingFields.push("aut_auct_ext_bfr_end_time");
  if (!min_decr_bid_val) missingFields.push("min_decr_bid_val");
  if (!timer_ext_val) missingFields.push("timer_ext_val");
  // if (!qty_split_criteria) missingFields.push("qty_split_criteria");
  if (!counter_offr_accept_timer)
    missingFields.push("counter_offr_accept_timer");

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
        custom_form, currency, start_price, dest_port,
        bag_size, bag_type, app_start_time, app_end_time,
        auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext,
        aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
        qty_split_criteria, counter_offr_accept_timer, img_url, auction_type,
        tender_id, audi_key, user_access, access_position, cal_formula, save_as, show_items, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        tender_title,
        tender_slug,
        tender_desc,
        tender_cat,
        tender_opt,
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
        accessPosition,
        formula,
        save_as,
        ShowItems,
        category,
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

    // Handle `editable_sheet`: Insert headers and sub-tenders
    const { headers, sub_tenders } = editable_sheet;

    // Insert headers into `tender_header` table and get the header_id
    for (let i = 0; i < headers.length; i++) {
      const { header, type, sortform } = headers[i];

      // Insert the tender_header row
      const [headerResult] = await db.query(
        `INSERT INTO tender_header 
           (tender_id, table_head, type, \`order\`, cal_col) 
         VALUES (?, ?, ?, ?, ?)`,
        [tender_id, header, type, i + 1, sortform]
      );
      const headerId = headerResult.insertId; // The header_id for this column

      // Now insert data for each Sub-Tender
      for (const subTender of sub_tenders) {
        const { name, rows } = subTender;

        // Make sure subtender row exists
        const [subTenderResult] = await db.query(
          `SELECT subtender_id 
             FROM subtender 
            WHERE subtender_name = ? 
              AND tender_id      = ?`,
          [name, tender_id]
        );

        let subtenderId;
        if (subTenderResult.length === 0) {
          const [newSubTender] = await db.query(
            `INSERT INTO subtender (subtender_name, tender_id)
             VALUES (?, ?)`,
            [name, tender_id]
          );
          subtenderId = newSubTender.insertId;
        } else {
          subtenderId = subTenderResult[0].subtender_id;
        }

        // Insert each row’s data for this column
        for (const [rowIndex, row] of rows.entries()) {
          // row[i] corresponds to the cell data for this column
          const cellData = row[i] ?? "";

          await db.query(
            `INSERT INTO seller_header_row_data (
               header_id, 
               row_data, 
               subtender_id, 
               seller_id, 
               \`order\`, 
               type, 
               row_number
             ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              headerId, // The column's header_id
              cellData, // Actual cell data
              subtenderId, // The subtender we are inserting for
              user_id,
              i + 1, // "order" could be column index or up to you
              type, // <-- Use the header's type (e.g. 'edit' or 'view')
              rowIndex + 1, // row_number
            ]
          );
        }
      }
    }

    // If accessType is private, insert selected buyers into `Tender_access`
    if (
      accessType === "private" &&
      Array.isArray(selected_buyers) &&
      selected_buyers.length > 0
    ) {
      // Loop through each buyer_id in the selected_buyers array
      for (const buyer_id of selected_buyers) {
        await db.query(
          `INSERT INTO tender_access (buyer_id, tender_id) VALUES (?, ?)`,
          [buyer_id, tender_id]
        );
      }
    }

    const token = req.headers["authorization"];

    const sellerDetailsResponse = await axios.post(
      userVerifyApi + "taqw-yvsu",
      {
        required_keys: "*",
        user_ids: [
          {
            type: "seller",
            user_id: req.user?.user_id,
          },
        ],
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (
      accessType == "private" &&
      Array.isArray(selected_buyers) &&
      selected_buyers.length > 0
    ) {
      for (const buyer_id of selected_buyers) {
        emitEvent(
          "Tender",
          {
            message: "New Tender Added",
            seller_id: req.user.user_id,
            company_name: sellerDetailsResponse?.data?.data[0]?.company_name,
            tender_id: tender_id,
            action_type: "New-Tender/Private",
            route: "/tenders/explore-tenders/",
          },
          "buyer",
          buyer_id
        );
      }
    } else {
      emitEvent(
        "Tender",
        {
          message: "New Tender Added",
          seller_id: req.user.user_id,
          company_name: sellerDetailsResponse?.data[0]?.company_name,
          tender_id: tender_id,
          action_type: "New-Tender/Public",
          route: "/tenders/explore-tenders/",
        },
        "buyer"
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    res
      .status(201)
      .send({ msg: "Tender created successfully", tender_id: tender_id });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error creating tender:", error.message);
    res
      .status(500)
      .send({ msg: "Error creating tender", error: error.message });
  }
});

module.exports = createNewTenderController;
