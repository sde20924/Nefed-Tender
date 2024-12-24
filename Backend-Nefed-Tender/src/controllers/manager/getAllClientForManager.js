const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const getAllClientForManager = asyncErrorHandler(async (req, res) => {
  const { user_id } = req.user;

  // Define queries for each manage_as type
  const queries = {
    buyer: `
      SELECT uma.*, b.first_name, b.last_name, b.email, 'buyer' AS type
      FROM user_manager_assignments uma
      JOIN buyer b ON uma.assigned_by = b.user_id
      WHERE uma.user_id = $1 AND uma.manage_as = 'buyer'
    `,
    seller: `
      SELECT uma.*, s.first_name, s.last_name, s.email, 'seller' AS type
      FROM user_manager_assignments uma
      JOIN seller s ON uma.assigned_by = s.user_id
      WHERE uma.user_id = $1 AND uma.manage_as = 'seller'
    `,
    admin: `
      SELECT uma.*, a.first_name, a.last_name, a.email, 'admin' AS type
      FROM user_manager_assignments uma
      JOIN admin a ON uma.assigned_by = a.user_id
      WHERE uma.user_id = $1 AND uma.manage_as = 'admin'
    `
  };

  // Separate arrays to hold results for each type
  let buyers = [];
  let sellers = [];
  let admins = [];

  // Fetch data for each type and store in respective arrays
  for (const manage_as in queries) {
    const { rows } = await db.query(queries[manage_as], [user_id]);
    if (manage_as === 'buyer') {
      buyers = buyers.concat(rows);
    } else if (manage_as === 'seller') {
      sellers = sellers.concat(rows);
    } else if (manage_as === 'admin') {
      admins = admins.concat(rows);
    }
  }

  if (buyers.length === 0 && sellers.length === 0 && admins.length === 0) {
    return res.status(404).send({ msg: 'No users found for this manager', success: false });
  }

  return res.status(200).send({
    msg: 'Manager users fetched successfully',
    data: {
      buyers,
      sellers,
      admins
    },
    success: true
  });
});

module.exports = getAllClientForManager;
