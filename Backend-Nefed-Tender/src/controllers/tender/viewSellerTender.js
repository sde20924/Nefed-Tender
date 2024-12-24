const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get all tenders of a specific seller
const getSellerTendersController = asyncErrorHandler(async (req, res) => {
  try {
    const sellerId = req.user.user_id; // Assuming the user ID is correctly set in the middleware
    // Query to fetch tenders for the specific seller
    const sellerTenderQuery = `SELECT * FROM manage_tender WHERE user_id = $1`;
    const { rows: sellerTenders } = await db.query(sellerTenderQuery, [sellerId]);

    // Prepare the response data
    const showSellerTenders = sellerTenders;

    // Return the response in the desired format
    return res.status(200).json({
      data: showSellerTenders,
      msg: "Seller tender data fetched successfully",
      success: true,
    });

  } catch (error) {
    console.error("Error fetching seller tenders:", error.message);
    return res.status(500).send({
      msg: "Error fetching seller tenders",
      error: error.message,
      success: false,
    });
  }
});

module.exports = {
  getSellerTendersController,
};
