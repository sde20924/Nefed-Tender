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
  console.log("+++++++++++++++++", selected_buyers);
  // Validation to ensure required fields are provided
  const missingFields = [];
  if (!tender_title) missingFields.push("tender_title");
  if (!emd_amt) missingFields.push("emd_amt");
  if (!emt_lvl_amt) missingFields.push("emt_lvl_amt");
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
        emd_amt, emt_lvl_amt, custom_form, currency, start_price, dest_port,
        bag_size, bag_type, app_start_time, app_end_time,
        auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext,
        aut_auct_ext_bfr_end_time, min_decr_bid_val, timer_ext_val,
        qty_split_criteria, counter_offr_accept_timer, img_url, auction_type,
        tender_id, audi_key,user_access
      ) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    // Handle `editable_sheet`: Insert headers and sub-tenders
    const { headers, sub_tenders } = editable_sheet;

    // Insert headers into `tender_header` table and get the header_id
    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      const [headerResult] = await db.query(
        `INSERT INTO tender_header (tender_id, table_head, \`order\`) VALUES (?, ?, ?)`,
        [tender_id, headerName, i + 1]
      );
      const headerId = headerResult.insertId; // Get the header_id for the inserted header

      for (const subTender of sub_tenders) {
        const { name, rows } = subTender;

        // Check if the subtender exists, insert if not
        let [subTenderResult] = await db.query(
          `SELECT subtender_id FROM subtender WHERE subtender_name = ? AND tender_id = ?`,
          [name, tender_id]
        );

        let subtenderId;
        if (subTenderResult.length === 0) {
          const [newSubTender] = await db.query(
            `INSERT INTO subtender (subtender_name,tender_id) VALUES (?,?)`,
            [name, tender_id]
          );
          subtenderId = newSubTender.insertId;
        } else {
          subtenderId = subTenderResult[0].subtender_id;
        }

        // Insert rows into `seller_header_row_data` table
        for (const [rowIndex, row] of rows.entries()) {
          for (let j = 0; j < row.length; j++) {
            const cellData = row[j];
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
      accessType === "private" &&
      Array.isArray(selected_buyers) &&
      selected_buyers.length > 0
    ) {
      for (const buyer_id of selected_buyers) {
        emitEvent(
          "New-Tender/Private",
          {
            message: "New Tender Created",
            seller_id: req.user.user_id,
            company_name: sellerDetailsResponse?.data?.data[0]?.company_name,
            tender_id: tender_id,
          },
          "buyer",
          buyer_id
        );
      }
    } else {
      emitEvent(
        "New-Tender/Public",
        {
          message: "New Tender Created",
          seller_id: req.user.user_id,
          company_name: sellerDetailsResponse?.data[0]?.company_name,
          tender_id: tender_id,
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
