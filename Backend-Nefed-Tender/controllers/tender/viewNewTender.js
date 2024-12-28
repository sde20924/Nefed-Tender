// File: controllers/tender/viewNewTender.js
const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get all tenders
const getAllTendersController = asyncErrorHandler(async (req, res) => {
  try {
    const tenderQuery = `SELECT * FROM manage_tender`;
    const [tenders] = await db.execute(tenderQuery); // Execute the query and get the result

    // Send the result as the response
    return res.status(200).json({
      data: tenders,
      msg: "Tender data fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tenders:", error.message);
    return res.status(500).json({
      msg: "Error fetching tender data",
      success: false,
      error: error.message,
    });
  }
});

module.exports = {
  getAllTendersController,
};
