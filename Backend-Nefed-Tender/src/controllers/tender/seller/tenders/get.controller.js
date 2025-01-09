// const { ManageTender } = require("../../../../models"); // Import your Sequelize model
const asyncErrorHandler = require("../../../../utils/asyncErrorHandler.js");

// Controller to get all tenders of a specific seller
const getSellerTendersController = asyncErrorHandler(async (req, res) => {
  try {
    const sellerId = req.user.user_id; // Assuming the user ID is correctly set in the middleware

    // Fetch tenders using Sequelize ORM methods, ordered by latest first
    const sellerTenders = await ManageTender.findAll({
      where: {
        user_id: sellerId, // Filter by user ID
      },
      order: [["created_at", "DESC"]], // Order by created_at in descending order
    });

    // Return the response in the desired format
    return res.status(200).json({
      data: sellerTenders,
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
