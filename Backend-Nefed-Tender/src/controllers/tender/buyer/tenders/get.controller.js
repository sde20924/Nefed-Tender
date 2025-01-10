import db from "../../../../models/index.js";
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

export const getTenderApplicationsByUser = asyncErrorHandler(
  async (req, res) => {
    const { user_id } = req.user; // Extract `user_id` from the decoded token

    try {
      // Query to fetch tender applications and their associated tender titles
      const query = `
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
        ta.user_id = :userId
    `;

      // Execute the query using Sequelize
      const [result] = await db.sequelize.query(query, {
        replacements: { userId: user_id },
      });

      // Handle case where no applications are found
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: "No tender applications found for the user",
          data:[]
        });
      }

      // Respond with the fetched applications
      res.status(200).json({
        success: true,
        msg: "Tender applications retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error retrieving tender applications:", error.message);

      // Respond with error details
      res.status(500).json({
        success: false,
        msg: "Error retrieving tender applications",
        error: error.message,
      });
    }
  }
);

export const getActiveTenders = asyncErrorHandler(async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (Epoch time)

    // Query to get tenders with application end time in the future
    const query = `
      SELECT * 
      FROM manage_tender 
      WHERE app_end_time > :currentTime 
      ORDER BY app_end_time ASC
    `;

    // Execute the query using Sequelize
    const [result] = await db.sequelize.query(query, {
      replacements: { currentTime },
    });

    // Handle case where no active tenders are found
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active tenders found.",
      });
    }

    // Return active tenders
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching active tenders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});

