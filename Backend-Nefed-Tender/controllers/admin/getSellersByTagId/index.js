const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const getSellerByTagId = asyncErrorHandler(async (req, res) => {
  const { tag_id } = req.params;

  const query = `
    SELECT * FROM seller 
    WHERE tag_id = $1 AND is_blocked = false
  `;

  const { rows } = await db.query(query, [tag_id]);

  if (rows.length === 0) {
    return res.status(404).send({ msg: 'No sellers found for the given tag_id', success: false });
  }

  return res.status(200).send({
    sellers: rows,
    msg: 'Sellers fetched successfully',
    success: true
  });
});

module.exports = getSellerByTagId;
