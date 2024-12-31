import db from '../../config/config.js';
import asyncErrorHandler from '../../utils/asyncErrorHandler.js';

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
  const userCheckQuery = `SELECT * FROM ${tableName} WHERE user_id = ?`;
  const [userRows] = await db.query(userCheckQuery, [assigned_by]);

  if (userRows.length === 0) {
    return res.status(404).send({ msg: 'Assigned by user not found', success: false });
  }

  // Check for duplicate manager assignment
  const duplicateCheckQuery = `
    SELECT * FROM user_manager_assignments 
    WHERE user_id = ? AND manager_id = ? AND assigned_by = ? AND manage_as = ?
  `;
  const [duplicateRows] = await db.query(duplicateCheckQuery, [user_id, manager_id, assigned_by, manage_as]);

  if (duplicateRows.length > 0) {
    return res.status(409).send({ msg: 'This manager is already assigned to the user for the given role', success: false });
  }

  // Insert into user_manager_assignments table
  const insertQuery = `
    INSERT INTO user_manager_assignments (user_id, manager_id, assigned_by, manage_as)
    VALUES (?, ?, ?, ?)
  `;
  const [insertResult] = await db.query(insertQuery, [user_id, manager_id, assigned_by, manage_as]);

  return res.status(201).send({
    msg: 'Manager assigned successfully',
    data: { id: insertResult.insertId, user_id, manager_id, assigned_by, manage_as },
    success: true
  });
});

export default addExistingManagerAsManager;
