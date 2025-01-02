import db from '../../../config/config2.js';
import asyncErrorHandler from '../../../utils/asyncErrorHandler.js';

const getBuyerByTagId = asyncErrorHandler(async (req, res) => {
  const { tag_id } = req.params;

  const query = `
    SELECT * FROM buyer 
    WHERE tag_id = $1 AND is_blocked = false
  `;

  const { rows } = await db.query(query, [tag_id]);

  if (rows.length === 0) {
    return res.status(404).send({ msg: 'No buyers found for the given tag_id', success: false });
  }

  return res.status(200).send({
    buyers: rows,
    msg: 'Buyers fetched successfully',
    success: true
  });
});

export default getBuyerByTagId;
