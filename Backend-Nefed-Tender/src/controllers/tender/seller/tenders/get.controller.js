import db from "../../../../models/index.js"; // Import database connection
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

// Controller to get all tenders of a specific seller
export const getSellerTendersController = asyncErrorHandler(
  async (req, res) => {
    try {
      const sellerId = req.user.user_id; // Assuming the user ID is correctly set in the middleware

      // Fetch tenders using Sequelize ORM methods, ordered by latest first
      const sellerTenders = await db.ManageTender.findAll({
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
  }
);

export const getSubmittedTenderApplications = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Validate user authentication
    if (!user_id) {
      return res.status(400).json({
        msg: "User not authenticated",
        success: false,
      });
    }

    // Query to fetch tenders created by the user
    const tenderIdsQuery = `
      SELECT tender_id, tender_title 
      FROM manage_tender 
      WHERE user_id = :userId
    `;
    const [tenderIdsResult] = await db.sequelize.query(tenderIdsQuery, {
      replacements: { userId: user_id },
    });

    // Check if no tenders are found
    if (tenderIdsResult.length === 0) {
      return res.status(404).json({
        msg: "No tenders found for the user",
        success: false,
      });
    }

    // Extract tender IDs
    const tenderIds = tenderIdsResult.map(({ tender_id }) => tender_id);

    // Prepare placeholders for the IN clause
    const placeholders = tenderIds.map((_, index) => `:id${index}`).join(", ");
    const replacements = tenderIds.reduce(
      (acc, id, index) => ({ ...acc, [`id${index}`]: id }),
      {}
    );

    // Query to fetch submitted applications for the user's tenders
    const applicationsQuery = `
      SELECT 
        ta.*, 
        mt.tender_title
      FROM 
        tender_application ta
      INNER JOIN 
        manage_tender mt 
      ON 
        ta.tender_id = mt.tender_id
      WHERE 
        ta.tender_id IN (${placeholders}) 
        AND ta.status = 'submitted'
    `;
    const [applicationsResult] = await db.sequelize.query(applicationsQuery, {
      replacements,
    });

    // Check if no applications are found
    if (applicationsResult.length === 0) {
      return res.status(404).json({
        msg: "No submitted applications found for the user's tenders",
        success: false,
      });
    }

    // Return the result
    return res.status(200).json({
      msg: "Submitted tender applications retrieved successfully",
      success: true,
      data: applicationsResult,
    });
  } catch (error) {
    console.error("Error retrieving submitted tender applications:", error.message);

    // Handle server errors
    return res.status(500).json({
      msg: "Error retrieving submitted tender applications",
      success: false,
      error: error.message,
    });
  }
};
