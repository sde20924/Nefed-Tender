import db from "../../config/config2.js"; // MySQL database connection
import asyncErrorHandler from "../../utils/asyncErrorHandler.js"; // Error handler middleware

/**
 * Controller to fetch the manager list.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getManagerList = asyncErrorHandler(async (req, res) => {
  try {
    // SQL query to fetch manager data
    const query = `
      SELECT 
        user_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_on
      FROM 
        manager
    `;

    // Execute the query
    const [rows] = await db.execute(query);

    // Respond with the result
    res.status(200).json({
      success: true,
      managerData: rows,
    });
  } catch (error) {
    console.error("Error fetching manager list:", error.message);

    // Respond with an error
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager list",
      error: error.message,
    });
  }
});
