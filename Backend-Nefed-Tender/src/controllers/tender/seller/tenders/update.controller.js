import db from "../../../../models/index.js"; // Import database connection
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";
import { emitEvent } from "../../../../socket/event/emit.js";
import { userVerifyApi } from "../../../../utils/external/api.js";
import axios from "axios";

export const updateTenderDetails = asyncErrorHandler(async (req, res) => {
  const { id: tender_id } = req.params;
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
    selected_buyers = [],
    audi_key = null,
    headers,
    sub_tender,
    accessPosition,
  } = req.body;

  // Input Validation (Optional but Recommended)
  // You can use a validation library like Joi or Yup to validate the input here

  // Parse attachments and custom_form if needed
  const parsedAttachments =
    typeof attachments === "string" ? JSON.parse(attachments) : attachments;
  const parsedCustomForm =
    typeof custom_form === "string" ? JSON.parse(custom_form) : custom_form;

  // Start a transaction to ensure atomicity
  const transaction = await db.sequelize.transaction();

  try {
    // Step 1: Update the manage_tender table
    const updateTenderQuery = `
      UPDATE manage_tender
      SET 
        tender_title = :tenderTitle,
        tender_slug = :tenderSlug,
        tender_desc = :tenderDesc,
        tender_cat = :tenderCat,
        tender_opt = :tenderOpt,
        custom_form = :customForm,
        currency = :currency,
        start_price = :startPrice,
        dest_port = :destPort,
        bag_size = :bagSize,
        bag_type = :bagType,
        app_start_time = :appStartTime,
        app_end_time = :appEndTime,
        auct_start_time = :auctStartTime,
        auct_end_time = :auctEndTime,
        time_frame_ext = :timeFrameExt,
        extended_at = :extendedAt,
        amt_of_ext = :amtOfExt,
        aut_auct_ext_bfr_end_time = :autAuctExtBfrEndTime,
        min_decr_bid_val = :minDecrBidVal,
        timer_ext_val = :timerExtVal,
        qty_split_criteria = :qtySplitCriteria,
        counter_offr_accept_timer = :counterOffrAcceptTimer,
        img_url = :imgUrl,
        auction_type = :auctionType,
        user_access = :userAccess,
        audi_key = :audiKey,
        access_position = :accessPosition
      WHERE tender_id = :tenderId
    `;

    const tenderValues = {
      tenderTitle: tender_title,
      tenderSlug: tender_slug,
      tenderDesc: tender_desc,
      tenderCat: tender_cat,
      tenderOpt: tender_opt,
      customForm: JSON.stringify(parsedCustomForm),
      currency,
      startPrice: start_price,
      destPort: dest_port,
      bagSize: bag_size,
      bagType: bag_type,
      appStartTime: app_start_time,
      appEndTime: app_end_time,
      auctStartTime: auct_start_time,
      auctEndTime: auct_end_time,
      timeFrameExt: time_frame_ext,
      // extendedAt,
      amtOfExt: amt_of_ext,
      autAuctExtBfrEndTime: aut_auct_ext_bfr_end_time,
      minDecrBidVal: min_decr_bid_val,
      timerExtVal: timer_ext_val,
      qtySplitCriteria: qty_split_criteria,
      counterOffrAcceptTimer: counter_offr_accept_timer,
      imgUrl: img_url,
      auctionType: auction_type,
      userAccess: accessType,
      audiKey: audi_key,
      accessPosition,
      tenderId: tender_id,
    };

    await db.sequelize.query(updateTenderQuery, {
      replacements: tenderValues,
      transaction,
    });

    // Step 2: Update attachments in `tender_required_doc`
    // Delete existing attachments
    const deleteAttachmentsQuery = `
      DELETE FROM tender_required_doc WHERE tender_id = :tenderId
    `;
    await db.sequelize.query(deleteAttachmentsQuery, {
      replacements: { tenderId: tender_id },
      type: QueryTypes.DELETE,
      transaction,
    });

    // Insert new attachments
    if (parsedAttachments && parsedAttachments.length > 0) {
      const insertAttachmentsQuery = `
        INSERT INTO tender_required_doc (tender_id, doc_key, doc_label, doc_ext, doc_size)
        VALUES (:tenderId, :docKey, :docLabel, :docExt, :docSize)
      `;

      for (const attachment of parsedAttachments) {
        const { key, label, extension, size } = attachment;
        await sequelize.query(insertAttachmentsQuery, {
          replacements: {
            tenderId: tender_id,
            docKey: key,
            docLabel: label,
            docExt: extension,
            docSize: size,
          },
          type: QueryTypes.INSERT,
          transaction,
        });
      }
    }

    // Step 3: Update headers in `tender_header`
    // Delete existing headers
    const deleteHeadersQuery = `
      DELETE FROM tender_header WHERE tender_id = :tenderId
    `;
    await db.sequelize.query(deleteHeadersQuery, {
      replacements: { tenderId: tender_id },
      type: QueryTypes.DELETE,
      transaction,
    });

    // Insert new headers
    if (headers && headers.length > 0) {
      const insertHeaderQuery = `
        INSERT INTO tender_header (tender_id, table_head, \`order\`)
        VALUES (:tenderId, :tableHead, :order)
      `;

      for (const header of headers) {
        const { header_id, table_head, order } = header;
        await db.sequelize.query(insertHeaderQuery, {
          replacements: {
            tenderId: tender_id,
            tableHead: table_head,
            order,
          },
          type: QueryTypes.INSERT,
          transaction,
        });
      }
    }

    // Step 4: Update sub_tender and related rows in `seller_header_row_data`
    // Delete existing subtenders
    const deleteSubTendersQuery = `
      DELETE FROM subtender WHERE tender_id = :tenderId
    `;
    await db.sequelize.query(deleteSubTendersQuery, {
      replacements: { tenderId: tender_id },
      type: QueryTypes.DELETE,
      transaction,
    });

    // Insert new subtenders and their row data
    if (sub_tender && sub_tender.length > 0) {
      for (const sub of sub_tender) {
        const { id, name, rows } = sub;

        // Insert into subtender table
        const insertSubTenderQuery = `
          INSERT INTO subtender (tender_id, subtender_name)
          VALUES (:tenderId, :subTenderName)
        `;
        const [subTenderResult] = await db.sequelize.query(
          insertSubTenderQuery,
          {
            replacements: {
              tenderId: tender_id,
              subTenderName: name,
            },
            type: QueryTypes.INSERT,
            transaction,
          }
        );

        const subtenderId = subTenderResult.insertId;

        // Insert row data for each row
        if (rows && rows.length > 0) {
          for (const [rowIndex, row] of rows.entries()) {
            for (const [cellIndex, cell] of row.entries()) {
              const { data, type } = cell;
              const header_id = headers[cellIndex]?.header_id || null;

              if (!header_id) {
                throw new Error(
                  `Header ID not found for cell index ${cellIndex}`
                );
              }

              const rowData = {
                header_id,
                row_data: data || "",
                subtender_id: subtenderId,
                seller_id: req.user.user_id,
                order: cellIndex + 1,
                type: cell === "" || cell === null ? "edit" : "view",
                row_number: rowIndex + 1,
              };

              const insertRowDataQuery = `
                INSERT INTO seller_header_row_data (
                  header_id, row_data, subtender_id, seller_id, \`order\`, type, row_number
                )
                VALUES (
                  :headerId, :rowData, :subTenderId, :sellerId, :order, :type, :rowNumber
                )
              `;

              await db.sequelize.query(insertRowDataQuery, {
                replacements: rowData,
                type: QueryTypes.INSERT,
                transaction,
              });
            }
          }
        }
      }
    }

    // Step 5: Update `tender_access` for private tenders
    if (accessType === "private") {
      // Delete existing access entries
      const deleteTenderAccessQuery = `
        DELETE FROM tender_access WHERE tender_id = :tenderId
      `;
      await sequelize.query(deleteTenderAccessQuery, {
        replacements: { tenderId: tender_id },
        type: QueryTypes.DELETE,
        transaction,
      });

      // Insert new access entries
      if (selected_buyers && selected_buyers.length > 0) {
        const insertTenderAccessQuery = `
          INSERT INTO tender_access (buyer_id, tender_id)
          VALUES (:buyerId, :tenderId)
        `;

        for (const buyer_id of selected_buyers) {
          await sequelize.query(insertTenderAccessQuery, {
            replacements: {
              buyerId: buyer_id,
              tenderId: tender_id,
            },
            type: QueryTypes.INSERT,
            transaction,
          });
        }
      }
    }

    // Step 6: Emit Events
    const token = req.headers["authorization"];

    // Fetch seller details
    const sellerDetailsResponse = await axios.post(
      `${userVerifyApi}/taqw-yvsu`,
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

    const companyName =
      sellerDetailsResponse?.data?.data?.[0]?.company_name || "Unknown Company";

    if (
      accessType === "private" &&
      Array.isArray(selected_buyers) &&
      selected_buyers.length > 0
    ) {
      for (const buyer_id of selected_buyers) {
        emitEvent(
          "Tender",
          {
            message: `Tender "${tender_title}" Updated`,
            seller_id: req.user.user_id,
            company_name: companyName,
            tender_id: tender_id,
            action_type: "Edit-Tender/Private",
          },
          "buyer",
          buyer_id
        );
      }
    } else {
      emitEvent(
        "Tender",
        {
          message: `Tender "${tender_title}" Updated`,
          seller_id: req.user.user_id,
          company_name: companyName,
          tender_id: tender_id,
          action_type: "Edit-Tender/Public",
        },
        "buyer"
      );
    }

    // Commit the transaction since all operations were successful
    await transaction.commit();

    // Send a success response
    res.status(200).json({
      success: true,
      msg: "Tender updated successfully",
      tender_id,
    });
  } catch (error) {
    // Rollback the transaction in case of any errors
    await transaction.rollback();
    console.error("Error updating tender:", error.message);
    res.status(500).json({
      success: false,
      msg: "Failed to update tender",
      error: error.message,
    });
  }
});

export const updateTenderApplicationBySeller = async (req, res) => {
  const { applicationId, action, reason } = req.body;

  try {
    // Validate input
    if (!applicationId || !action) {
      return res
        .status(400)
        .json({ message: "Application ID and action are required" });
    }

    // Start a transaction
    const transaction = await db.sequelize.transaction();

    // Check if the tender application exists
    const [checkResult] = await db.sequelize.query(
      "SELECT * FROM tender_application WHERE tender_application_id = :applicationId",
      {
        replacements: { applicationId },

        transaction,
      }
    );

    if (checkResult.length === 0) {
      await transaction.rollback(); // Rollback if application doesn't exist
      return res.status(404).json({ message: "Tender application not found" });
    }

    // Prepare and execute the update query
    const updateQuery = `
      UPDATE tender_application 
      SET status = :action, rejected_reason = :rejectedReason 
      WHERE tender_application_id = :applicationId`;
    const updateValues = {
      action,
      rejectedReason: action === "rejected" ? reason : null,
      applicationId,
    };

    const [updateResult] = await db.sequelize.query(updateQuery, {
      replacements: updateValues,
      transaction,
    });

    if (updateResult.affectedRows === 0) {
      await transaction.rollback(); // Rollback if update fails
      return res
        .status(500)
        .json({ message: "Failed to update tender application" });
    }

    // Fetch the updated record
    const [updatedRecord] = await db.sequelize.query(
      "SELECT * FROM tender_application WHERE tender_application_id = :applicationId",
      {
        replacements: { applicationId },

        transaction,
      }
    );

    // Commit transaction
    await transaction.commit();

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

    emitEvent(
      "Tender",
      {
        message: `Your Application ${action.toUpperCase()} By ${
          sellerDetailsResponse?.data?.data[0]?.company_name
        }`,
        seller_id: req.user.user_id,
        company_name: sellerDetailsResponse?.data?.data[0]?.company_name,
        tender_id: updatedRecord[0]?.tender_id,
        action_type: "Application-status",
      },
      "buyer",
      updatedRecord[0]?.user_id
    );

    return res.status(200).json({
      message: "Tender application updated successfully",
      tenderApplication: updatedRecord[0],
    });
  } catch (error) {
    console.error("Error updating tender application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
