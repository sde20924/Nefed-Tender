// File: controllers/tender/viewNewTender.js
import db from '../../config/config2.js'; // ES6 import for database connection
import asyncErrorHandler from '../../utils/asyncErrorHandler.js'; // Middleware for async error handling

/**
 * Controller to fetch all tenders from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllTendersController = asyncErrorHandler(async (req, res) => {
  try {
    // SQL query to fetch all tenders
    const tenderQuery = `
      SELECT tender_id, tender_title, tender_desc, created_at, updated_at 
      FROM manage_tender
      ORDER BY created_at DESC
    `;
    const [tenders] = await db.execute(tenderQuery);

    // Check if tenders exist
    if (!tenders.length) {
      return res.status(404).json({
        msg: "No tenders found",
        success: false,
      });
    }

    // Success response
    return res.status(200).json({
      data: tenders,
      msg: "Tender data fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tenders:", error.message);

    // Error response
    return res.status(500).json({
      msg: "Error fetching tender data",
      success: false,
      error: error.message,
    });
  }
});
