// controllers/tenderApplicationController.js

const db = require('../../config/config'); // Adjust to the path where your models are defined

// Controller to update tender application
const updateTenderApplicationBySeller = async (req, res) => {
    const { applicationId, action, reason } = req.body;

  try {
    // Query to check if the tender application exists
    const checkQuery = 'SELECT * FROM tender_application WHERE tender_application_id = $1';
    const checkResult = await db.query(checkQuery, [applicationId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tender application not found' });
    }

    // Prepare the SQL query to update the tender application
    const updateQuery = `
      UPDATE tender_application 
      SET status = $1, rejected_reason = $2 
      WHERE tender_application_id = $3
      RETURNING *;
    `;
    const values = [action, action === 'rejected' ? reason : null, applicationId];

    // Execute the update query
    const updateResult = await db.query(updateQuery, values);

    res.status(200).json({ message: 'Tender application updated successfully', tenderApplication: updateResult.rows[0] });
  } catch (error) {
    console.error('Error updating tender application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
    updateTenderApplicationBySeller,
};