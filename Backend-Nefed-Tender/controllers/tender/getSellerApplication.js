const db = require('../../config/config'); // MySQL database configuration

const getSubmittedTenderApplications = async (req, res) => {
  // Validate user authentication
  if (!req.user || !req.user.user_id) {
    return res.status(400).send({ msg: 'User not authenticated', success: false });
  }

  const { user_id } = req.user;

  try {
    const tenderIdsQuery = `
      SELECT tender_id, tender_title 
      FROM manage_tender 
      WHERE user_id = ?
    `;
    const [tenderIdsResult] = await db.execute(tenderIdsQuery, [user_id]);

    // Check if no tenders are found
    if (!tenderIdsResult.length) {
      return res.status(404).send({ msg: 'No tenders found for the user', success: false });
    }

    // Extract tender IDs
    const tenderIds = tenderIdsResult.map(row => row.tender_id);


    const placeholders = tenderIds.map(() => '?').join(',');
    const applicationsQuery = `mbmbbbnnnn
      SELECT ta.*, mt.tender_title, b.first_name, b.last_name, b.company_name
      FROM tender_application ta
      INNER JOIN manage_tender mt ON ta.tender_id = mt.tender_id
      INNER JOIN buyer b ON ta.user_id = b.user_id
      WHERE ta.tender_id IN (${placeholders}) AND ta.status = 'submitted'
    `;
    const [applicationsResult] = await db.execute(applicationsQuery, tenderIds);

    // Check if no applications are found
    if (!applicationsResult.length) {
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
    res.status(500).send({
      msg: 'Error retrieving submitted tender applications',
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getSubmittedTenderApplications,
};
