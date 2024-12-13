const db = require('../../config/config'); // Replace with your actual path

// Controller to get tender details along with the lowest bid amount for that tender
const getTenderMiniSummary = async (req, res) => {
  const { tender_id } = req.params;

  try {
    // Combined query to get data from manage_tender and the lowest bid from tender_bid_room
    const query = `
      SELECT mt.tender_title, mt.qty, mt.dest_port, mt.app_start_time,
             tbr.bid_amount, tbr.fob_amount, tbr.freight_amount
      FROM manage_tender mt
      LEFT JOIN (
        SELECT tender_id, MIN(bid_amount) AS bid_amount, fob_amount, freight_amount
        FROM tender_bid_room
        WHERE tender_id = $1
        GROUP BY tender_id, fob_amount, freight_amount
      ) tbr ON mt.tender_id = tbr.tender_id
      WHERE mt.tender_id = $1;
    `;

    const values = [tender_id];
    const result = await db.query(query, values);

    // If no result is found, return an error response
    if (result.rows.length === 0) {
      return res.status(404).send({ msg: 'No tender details found for the given ID', success: false });
    }

    // Success response with the retrieved data
    res.status(200).send({
      msg: 'Tender details and lowest bid retrieved successfully',
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error retrieving tender details and lowest bid:', error.message);
    res.status(500).send({ msg: 'Error retrieving tender details and lowest bid', success: false });
  }
};

module.exports = {
  getTenderMiniSummary,
};
