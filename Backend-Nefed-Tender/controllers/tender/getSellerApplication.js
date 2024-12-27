const db = require('../../config/config'); // MySQL database configuration

const getSubmittedTenderApplications = async (req, res) => {
  const { user_id } = req.user; // Extract `user_id` from the token

  try {
    // Step 1: Get `tender_id` and `tender_title` from `manage_tender` table where `user_id` matches
    const tenderIdsQuery = `
      SELECT tender_id, tender_title 
      FROM manage_tender 
      WHERE user_id = ?
    `;
    const [tenderIdsResult] = await db.execute(tenderIdsQuery, [user_id]);

    // If no tenders found, return 404
    if (tenderIdsResult.length === 0) {
      return res.status(404).send({ msg: 'No tenders found for the user', success: false });
    }

    // Extract tender_ids from the result
    const tenderIds = tenderIdsResult.map(row => row.tender_id);

    // If no tender IDs exist, return 404
    if (tenderIds.length === 0) {
      return res.status(404).send({ msg: 'No submitted applications found for the user tenders', success: false });
    }

    // Step 2: Get applications from `tender_application` table where `tender_id` matches and `status` is "submitted"
    const placeholders = tenderIds.map(() => '?').join(','); // Create placeholders for IN clause
    const applicationsQuery = `
      SELECT ta.*, mt.tender_title, b.first_name, b.last_name, b.company_name
      FROM tender_application ta
      INNER JOIN manage_tender mt ON ta.tender_id = mt.tender_id
      INNER JOIN buyer b ON ta.user_id = b.user_id
      WHERE ta.tender_id IN (${placeholders}) AND ta.status = 'submitted'
    `;
    const [applicationsResult] = await db.execute(applicationsQuery, tenderIds);

    // If no submitted applications found, return 404
    if (applicationsResult.length === 0) {
      return res.status(404).send({ msg: 'No submitted applications found for the user tenders', success: false });
    }

    // Return the result
    res.status(200).send({
      msg: 'Submitted tender applications retrieved successfully',
      success: true,
      data: applicationsResult,
    });
  } catch (error) {
    console.error('Error retrieving submitted tender applications:', error.message);
    res.status(500).send({ msg: 'Error retrieving submitted tender applications', success: false });
  }
};

module.exports = {
  getSubmittedTenderApplications,
};
