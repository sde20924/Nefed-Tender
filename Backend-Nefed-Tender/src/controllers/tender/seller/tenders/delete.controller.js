import db from "../../../../models/index.js"; // Import database connection
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

export const deleteTenderController = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  // Start a transaction to ensure atomicity
  const transaction = await db.sequelize.transaction();

  try {
    // Step 1: Delete related records from associated tables (if necessary)
    // Assuming you have related tables like tender_required_doc, tender_header, etc.
    // Uncomment and modify the following sections based on your actual database schema

    /*
    // Example: Delete attachments related to the tender
    const deleteAttachmentsQuery = `
      DELETE FROM tender_required_doc
      WHERE tender_id = :tenderId
    `;
    await sequelize.query(deleteAttachmentsQuery, {
      replacements: { tenderId: id },
      type: QueryTypes.DELETE,
      transaction,
    });

    // Example: Delete headers related to the tender
    const deleteHeadersQuery = `
      DELETE FROM tender_header
      WHERE tender_id = :tenderId
    `;
    await sequelize.query(deleteHeadersQuery, {
      replacements: { tenderId: id },
      type: QueryTypes.DELETE,
      transaction,
    });

    // Repeat for other related tables as necessary
    */

    // Step 2: Delete the tender from manage_tender table
    const deleteTenderQuery = `
      DELETE FROM manage_tender
      WHERE tender_id = :tenderId
    `;
    const [result] = await db.sequelize.query(deleteTenderQuery, {
      replacements: { tenderId: id },
      transaction,
    });

    // Check if any rows were affected (i.e., tender was found and deleted)
    if (result.affectedRows === 0) {
      // If no rows were deleted, rollback the transaction and send a 404 response
      await transaction.rollback();
      return res.status(404).json({ success: false, msg: "Tender not found" });
    }

    // Commit the transaction since deletion was successful
    await transaction.commit();

    // Send a success response
    res.status(200).json({ success: true, msg: "Tender deleted successfully" });
  } catch (error) {
    // If any error occurs, rollback the transaction
    await transaction.rollback();
    console.error("Error deleting tender:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete tender",
      error: error.message,
    });
  }
});

