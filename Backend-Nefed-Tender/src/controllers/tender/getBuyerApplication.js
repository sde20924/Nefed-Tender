const express = require('express'); // Express framework
const db = require('../../config/config'); // Database configuration (replace with your actual path)
const jwt = require('jsonwebtoken'); // JWT library for token handling

// Controller to get tender applications by user ID from token
const getTenderApplicationsByUser = async (req, res) => {
  const { user_id } = req.user; // Extract `user_id` from the token

  try {
    // Fetch data from `tender_application` table where `user_id` matches the token's user ID
    // Join with `manage_tender` table to get `tender_title` based on `tender_id`
    const query = `
      SELECT ta.*, mt.tender_title
      FROM tender_application ta
      INNER JOIN manage_tender mt ON ta.tender_id = mt.tender_id
      WHERE ta.user_id = $1
    `;
    
    const result = await db.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).send({ msg: 'No tender applications found for the user', success: false });
    }

    res.status(200).send({
      msg: 'Tender applications retrieved successfully',
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving tender applications:', error.message);
    res.status(500).send({ msg: 'Error retrieving tender applications', success: false });
  }
};

module.exports = {
  getTenderApplicationsByUser,
};
