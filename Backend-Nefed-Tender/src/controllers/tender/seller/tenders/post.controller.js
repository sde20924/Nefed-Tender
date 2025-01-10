import db from "../../../../models/index.js"; // Import database connection
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";
import { emitEvent } from "../../../../socket/event/emit.js";
import { userVerifyApi } from "../../../../utils/external/api.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export const createNewTenderController = asyncErrorHandler(async (req, res) => {
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
    ShowItems,
    category,
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
  const transaction = await db.db.sequelize.transaction();

  try {
    const parsedAttachments =
      typeof attachments === "string" ? JSON.parse(attachments) : attachments;
    const parsedCustomForm =
      typeof custom_form === "string" ? JSON.parse(custom_form) : custom_form;

    const newTender = await db.ManageTender.create(
      {
        user_id,
        tender_title,
        tender_slug,
        tender_desc,
        tender_cat,
        tender_opt,
        custom_form: JSON.stringify(parsedCustomForm),
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
        user_access: accessType,
        access_position: accessPosition,
        cal_formula: formula,
        save_as,
        show_items: ShowItems,
        category,
      },
      { transaction }
    );

    // Insert attachments into TenderRequiredDoc
    if (Array.isArray(parsedAttachments)) {
      const attachmentsToCreate = parsedAttachments.map((attachment) => ({
        tender_id: tender_id || newTender.id, // Use newTender.id if tender_id not provided
        doc_key: attachment.key,
        doc_label: attachment.label,
        doc_ext: attachment.extension,
        doc_size: attachment.maxFileSize,
      }));

      await db.TenderRequiredDoc.bulkCreate(attachmentsToCreate, {
        transaction,
      });
    }

    // Handle `editable_sheet`: Insert headers and sub-tenders

    if (
      editable_sheet &&
      editable_sheet.headers &&
      editable_sheet.sub_tenders
    ) {
      const { headers, sub_tenders } = editable_sheet;

      for (let i = 0; i < headers.length; i++) {
        const { header, type, sortform } = headers[i];

        // Create TenderHeader
        const tenderHeader = await db.TenderHeader.create(
          {
            tender_id: tender_id || newTender.id,
            table_head: header,
            type,
            order: i + 1,
            cal_col: sortform,
          },
          { transaction }
        );

        // Handle SubTenders
        for (const subTender of sub_tenders) {
          const { name, rows } = subTender;

          // Find or create SubTender
          const [existingSubTender] = await db.Subtender.findOrCreate({
            where: {
              subtender_name: name,
              tender_id: tender_id || newTender.id,
            },
            defaults: {
              subtender_name: name,
              tender_id: tender_id || newTender.id,
            },
            transaction,
          });

          const subtenderId = existingSubTender.subtender_id;

          // Prepare SellerHeaderRowData entries
          const rowDataEntries = rows.map((row, rowIndex) => ({
            header_id: tenderHeader.id,
            row_data: row[i] ?? "",
            subtender_id: subtenderId,
            seller_id: user_id,
            order: i + 1,
            type, // Assuming type is from header
            row_number: rowIndex + 1,
          }));

          // Bulk create SellerHeaderRowData
          await db.SellerHeaderRowData.bulkCreate(rowDataEntries, {
            transaction,
          });
        }
      }
    }

    // If accessType is private, insert selected buyers into `Tender_access`
    if (
      accessType === "private" &&
      Array.isArray(selected_buyers) &&
      selected_buyers.length > 0
    ) {
      const accessEntries = selected_buyers.map((buyer_id) => ({
        buyer_id,
        tender_id: tender_id || newTender.id,
      }));

      await TenderAccess.bulkCreate(accessEntries, { transaction });
    }

    // Commit the transaction before making external API calls and emitting events

    // const token = req.headers["authorization"];

    // const sellerDetailsResponse = await axios.post(
    //   `${userVerifyApi}/taqw-yvsu`,
    //   {
    //     required_keys: "*",
    //     user_ids: [
    //       {
    //         type: "seller",
    //         user_id: user_id,
    //       },
    //     ],
    //   },
    //   {
    //     headers: {
    //       Authorization: token,
    //     },
    //   }
    // );

    // const companyName =
    //   sellerDetailsResponse?.data?.data?.[0]?.company_name || "Unknown Company";

    // // Emit events based on accessType
    // if (accessType === "private" && selected_buyers.length > 0) {
    //   for (const buyer_id of selected_buyers) {
    //     emitEvent(
    //       "Tender",
    //       {
    //         message: "New Tender Added",
    //         seller_id: user_id,
    //         company_name: companyName,
    //         tender_id: tender_id || newTender.id,
    //         action_type: "New-Tender/Private",
    //         route: "/tenders/explore-tenders/",
    //       },
    //       "buyer",
    //       buyer_id
    //     );
    //   }
    // } else {
    //   emitEvent(
    //     "Tender",
    //     {
    //       message: "New Tender Added",
    //       seller_id: user_id,
    //       company_name: companyName,
    //       tender_id: tender_id || newTender.id,
    //       action_type: "New-Tender/Public",
    //       route: "/tenders/explore-tenders/",
    //     },
    //     "buyer"
    //   );
    // }
    await transaction.commit();
    // Send success response
    res.status(201).json({
      msg: "Tender created successfully",
      tender_id: tender_id || newTender.id,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating tender:", error.message);
    res
      .status(500)
      .send({ msg: "Error creating tender", error: error.message });
  }
});

// Function to generate a unique Tender ID
const generateTenderId = () => {
  return uuidv4(); // Generates a universally unique identifier (UUID)
};

// Controller to clone a tender for the specific seller
export const cloneTenderController = asyncErrorHandler(async (req, res) => {
  const { id } = req.params; // Tender ID that needs to be cloned
  const sellerId = req.user.user_id; // Assuming the user ID is correctly set in the middleware
  const transaction = await db.sequelize.transaction();
  try {
    // Query to find the tender to be cloned, making sure it belongs to the seller
    const tenderQuery = `
      SELECT * FROM manage_tender
      WHERE tender_id = :tenderId AND user_id = :userId
      LIMIT 1
    `;
    const tenderToClone = await db.sequelize.query(tenderQuery, {
      replacements: { tenderId: id, userId: sellerId },
      transaction,
    });

    if (tenderToClone.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, msg: "Tender not found or not authorized" });
    }

    const tender = tenderToClone[0];
    const newTenderId = generateTenderId(); // Implement this function as per your requirements
    const newTitle = `${tender.tender_title.trim()} - Clone`;

    // Clone the tender and insert it into the manage_tender table
    const cloneQuery = `
      INSERT INTO manage_tender (
        tender_id, user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt,
        emd_amt, emt_lvl_amt, currency, start_price, qty, dest_port, bag_size, bag_type,
        measurement_unit, app_start_time, app_end_time, auct_start_time, auct_end_time,
        time_frame_ext, extended_at, amt_of_ext, aut_auct_ext_bfr_end_time, 
        min_decr_bid_val, timer_ext_val, qty_split_criteria, counter_offr_accept_timer,
        img_url, auction_type, audi_key
      ) VALUES (
        :newTenderId, :userId, :newTitle, :tenderSlug, :tenderDesc, :tenderCat, :tenderOpt,
        :emdAmt, :emtLvlAmt, :currency, :startPrice, :qty, :destPort, :bagSize, :bagType,
        :measurementUnit, :appStartTime, :appEndTime, :auctStartTime, :auctEndTime,
        :timeFrameExt, :extendedAt, :amtOfExt, :autAuctExtBfrEndTime, 
        :minDecrBidVal, :timerExtVal, :qtySplitCriteria, :counterOffrAcceptTimer,
        :imgUrl, :auctionType, :audiKey
      )
    `;

    // Prepare values for the new tender
    const values = {
      newTenderId,
      userId: sellerId,
      newTitle,
      tenderSlug: tender.tender_slug, // Ensure this remains unique or modify as needed
      tenderDesc: tender.tender_desc,
      tenderCat: tender.tender_cat,
      tenderOpt: tender.tender_opt,
      emdAmt: tender.emd_amt,
      emtLvlAmt: tender.emt_lvl_amt,
      currency: tender.currency,
      startPrice: tender.start_price,
      qty: tender.qty, // Ensure this field exists; adjust if necessary
      destPort: tender.dest_port,
      bagSize: tender.bag_size,
      bagType: tender.bag_type,
      measurementUnit: tender.measurement_unit,
      appStartTime: tender.app_start_time,
      appEndTime: tender.app_end_time,
      auctStartTime: tender.auct_start_time,
      auctEndTime: tender.auct_end_time,
      timeFrameExt: tender.time_frame_ext,
      extendedAt: tender.extended_at,
      amtOfExt: tender.amt_of_ext,
      autAuctExtBfrEndTime: tender.aut_auct_ext_bfr_end_time,
      minDecrBidVal: tender.min_decr_bid_val,
      timerExtVal: tender.timer_ext_val,
      qtySplitCriteria: tender.qty_split_criteria,
      counterOffrAcceptTimer: tender.counter_offr_accept_timer,
      imgUrl: tender.img_url,
      auctionType: tender.auction_type,
      audiKey: tender.audi_key,
    };

    // Execute the insert query within the transaction
    await db.sequelize.query(cloneQuery, {
      replacements: values,
      transaction,
    });

    // Return success response with the new tender ID
    res.status(201).json({
      success: true,
      msg: "Tender cloned successfully",
      clonedId: newTenderId,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      msg: "Failed to clone tender",
      error: error.message,
    });
  }
});

export const submitFileUrl = async (req, res) => {
  const { tender_id, file_url, status, tender_user_doc_id = null } = req.body;
  const { user_id } = req.user; // Assuming 'req.user' contains authenticated user details

  const transaction = await db.sequelize.transaction(); // Start transaction

  try {
    console.log(req.body);

    // Check if the user already has an application for this specific tender
    const [existingApp] = await db.sequelize.query(
      `SELECT tender_application_id 
       FROM tender_application 
       WHERE tender_id = :tenderId AND user_id = :userId`,
      {
        replacements: { tenderId: tender_id, userId: user_id },
        transaction,
      }
    );

    let tender_application_id;
    if (existingApp.length > 0) {
      // If the user has already applied, get the existing tender_application_id
      tender_application_id = existingApp[0].tender_application_id;

      // Update the application status
      await db.sequelize.query(
        `UPDATE tender_application 
         SET status = :status 
         WHERE tender_application_id = :tenderApplicationId AND user_id = :userId`,
        {
          replacements: {
            status,
            tenderApplicationId: tender_application_id,
            userId: user_id,
          },

          transaction,
        }
      );
    } else {
      // If no existing application for the user, create a new one
      const [insertResult] = await db.sequelize.query(
        `INSERT INTO tender_application (tender_id, user_id, status) 
         VALUES (:tenderId, :userId, :status)`,
        {
          replacements: { tenderId: tender_id, userId: user_id, status },

          transaction,
        }
      );

      if (insertResult.affectedRows === 0) {
        throw new Error("Failed to insert tender application");
      }
      // console.log("DSGRGRHBRTHTH", insertResult);
      tender_application_id = insertResult;
    }

    // Process each file URL for this user's tender application
    for (const file of file_url) {
      const { tender_doc_id, doc_url } = file;

      if (tender_user_doc_id) {
        // Update existing document URL if tender_user_doc_id is provided
        await db.sequelize.query(
          `UPDATE tender_user_doc 
           SET doc_url = :docUrl 
           WHERE tender_user_doc_id = :tenderUserDocId`,
          {
            replacements: {
              docUrl: doc_url,
              tenderUserDocId: tender_user_doc_id,
            },

            transaction,
          }
        );
      } else {
        // Insert new document if no tender_user_doc_id is provided
        // console.log("DFEIFHEF", tender_application_id);
        await db.sequelize.query(
          `INSERT INTO tender_user_doc (tender_application_id, tender_id, user_id, tender_doc_id, doc_url)
           VALUES (:tenderApplicationId, :tenderId, :userId, :tenderDocId, :docUrl)`,
          {
            replacements: {
              tenderApplicationId: tender_application_id,
              tenderId: tender_id,
              userId: user_id,
              tenderDocId: tender_doc_id,
              docUrl: doc_url,
            },
            transaction,
          }
        );
      }
    }

    // Fetch seller details for event emission
    const [rows] = await db.sequelize.query(
      `SELECT user_id 
       FROM manage_tender 
       WHERE tender_id = :tenderId`,
      {
        replacements: { tenderId: tender_id },

        transaction,
      }
    );

    // Buyer details
    // const token = req.headers["authorization"];

    // const buyerDetailsResponse = await axios.post(
    //   userVerifyApi + "taqw-yvsu",
    //   {
    //     required_keys: "*",
    //     user_ids: [
    //       {
    //         type: "buyer",
    //         user_id: req.user?.user_id,
    //       },
    //     ],
    //   },
    //   {
    //     headers: {
    //       Authorization: token,
    //     },
    //   }
    // );

    // emitEvent(
    //   "Tender",
    //   {
    //     message: `New Application Submitted By ${buyerDetailsResponse?.data?.data[0]?.company_name}`,
    //     buyer_id: req.user.user_id,
    //     company_name: buyerDetailsResponse?.data?.data[0]?.company_name,
    //     tender_id: tender_id,
    //     seller_id: rows[0].user_id,
    //     action_type: "New-Application",
    //   },
    //   "seller",
    //   rows[0]?.user_id
    // );

    // Commit transaction
    await transaction.commit();

    res
      .status(201)
      .json({ msg: "File URLs processed successfully", success: true });
  } catch (error) {
    // Roll back the transaction in case of an error
    await transaction.rollback();
    console.error("Error processing file URLs:", error.message);
    res.status(500).json({ msg: "Error processing file URLs", success: false });
  }
};
