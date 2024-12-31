const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

const listOfPendingUsers = asyncErrorHandler(async (req, res) => {
  
    // Query to fetch buyers with status as 'not_verified'
    const buyerQuery = `
      SELECT *, 'buyer' AS type
      FROM buyer
      WHERE status = 'not_verified'
      ORDER BY created_on DESC
    `;
    const { rows: buyers } = await db.query(buyerQuery);

    // Query to fetch sellers with status as 'not_verified'
    const sellerQuery = `
      SELECT *, 'seller' AS type
      FROM seller
      WHERE status = 'not_verified'
      ORDER BY created_on DESC
    `;
    const { rows: sellers } = await db.query(sellerQuery);

    const not_verified_users = { buyers, sellers };

    return res.status(200).json({
      success: true,
      not_verified_users,
      msg: "Pending users list fetched successfully"
    });
  } )

  module.exports = listOfPendingUsers ;