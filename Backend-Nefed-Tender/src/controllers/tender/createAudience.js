import db from '../../config/config2.js';
import asyncErrorHandler from "../../utils/asyncErrorHandler.js";
import generateUniqueId from '../../utils/generateUniqueId.js';

/**
 * Controller to create an audience with a unique ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const createAudienceController = asyncErrorHandler(async (req, res) => {
  const { user_id } = req.user; // Extract authenticated user ID
  const audience_id = generateUniqueId(); // Generate a unique ID for the audience

  const { audience_name, user_type, audience } = req.body;

  // Validate required fields
  if (!audience_name || !user_type || !audience || !Array.isArray(audience)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid input: 'audience_name', 'user_type', and 'audience' are required, and 'audience' must be an array." 
    });
  }

  try {
    console.log("Creating audience with data:", { user_id, audience_id, audience_name, user_type, audience });

    // Insert audience details into the database
    const insertQuery = `
      INSERT INTO audience (
        audience_id, 
        user_id, 
        audience_name, 
        user_type, 
        audience_data
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const audienceData = JSON.stringify(audience); // Convert audience array to a JSON string for storage
    const [result] = await db.query(insertQuery, [audience_id, user_id, audience_name, user_type, audienceData]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to insert audience into the database");
    }

    // Return success response
    return res.status(201).json({ 
      success: true, 
      message: "Audience created successfully", 
      audience_id 
    });
  } catch (error) {
    console.error("Error creating audience:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create audience", 
      error: error.message 
    });
  }
});
