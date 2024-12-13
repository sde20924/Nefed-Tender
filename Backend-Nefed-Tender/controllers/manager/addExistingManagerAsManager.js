const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const addExistingManagerAsManager = asyncErrorHandler(async (req, res) => {
  const { user_id, manager_id, assigned_by, manage_as } = req.body;

  // Determine the table based on manage_as
  const tableName = {
    buyer: 'buyer',
    seller: 'seller',
    admin: 'admin'
  }[manage_as];

  if (!tableName) {
    return res.status(400).send({ msg: 'Invalid user type', success: false });
  }

  // Check if assigned_by exists in the respective table
  const userCheckQuery = `SELECT * FROM ${tableName} WHERE user_id = $1`;
  const { rows: userRows } = await db.query(userCheckQuery, [assigned_by]);

  if (userRows.length === 0) {
    return res.status(404).send({ msg: 'Assigned by user not found', success: false });
  }

  // Check for duplicate manager assignment
  const duplicateCheckQuery = `
    SELECT * FROM user_manager_assignments 
    WHERE user_id = $1 AND manager_id = $2 AND assigned_by = $3 AND manage_as = $4
  `;
  const { rows: duplicateRows } = await db.query(duplicateCheckQuery, [user_id, manager_id, assigned_by, manage_as]);

  if (duplicateRows.length > 0) {
    return res.status(409).send({ msg: 'This manager is already assigned to the user for the given role', success: false });
  }

  // Insert into user_manager_assignments table
  const insertQuery = `
    INSERT INTO user_manager_assignments (user_id, manager_id, assigned_by, manage_as)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows: insertRows } = await db.query(insertQuery, [user_id, manager_id, assigned_by, manage_as]);

  return res.status(201).send({
    msg: 'Manager assigned successfully',
    data: insertRows[0],
    success: true
  });
});

module.exports = addExistingManagerAsManager;
