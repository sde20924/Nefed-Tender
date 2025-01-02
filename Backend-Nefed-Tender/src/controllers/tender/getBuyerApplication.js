import express from 'express'; // Express framework
import db from '../../config/config2.js'; // Database configuration
import jwt from 'jsonwebtoken'; // JWT library for token handling

/**
 * Controller to get tender applications by user ID from the token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getTenderApplicationsByUser = async (req, res) => {
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
        ta.user_id = ?
    `;
    
    // Execute the query
    const [result] = await db.query(query, [user_id]);

    // Handle case where no applications are found
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No tender applications found for the user',
      });
    }

    // Respond with the fetched applications
    res.status(200).json({
      success: true,
      msg: 'Tender applications retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error retrieving tender applications:', error.message);

    // Respond with error details
    res.status(500).json({
      success: false,
      msg: 'Error retrieving tender applications',
    });
  }
};
