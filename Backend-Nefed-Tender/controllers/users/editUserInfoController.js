const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const editUserInfoController = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.user;
  const { first_name, last_name, company_name, registration_number, adhaar_number, pan_number, gst_number, phone_number } = req.body;

  // Validation: Ensure at least one field is provided for update
  if (!first_name && !last_name && !company_name && !registration_number && !adhaar_number && !pan_number && !gst_number && !phone_number) {
    return res.status(400).send({ msg: 'At least one field must be provided for update', sts: "FAILED", success: false });
  }

  // Determine the table based on the login_as value
  const tableName = {
    admin: 'admin',
    buyer: 'buyer',
    seller: 'seller',
    manager: 'manager'
  }[login_as];

  if (!tableName) {
    return res.status(400).send({ msg: 'Invalid user type', sts: "FAILED", success: false });
  }

  // Build dynamic update query
  let updateFields = [];
  let updateValues = [];
  let queryIndex = 1;

  if (first_name) {
    updateFields.push(`first_name = $${queryIndex++}`);
    updateValues.push(first_name);
  }
  if (last_name) {
    updateFields.push(`last_name = $${queryIndex++}`);
    updateValues.push(last_name);
  }
  if (company_name) {
    updateFields.push(`company_name = $${queryIndex++}`);
    updateValues.push(company_name);
  }
  if (registration_number) {
    updateFields.push(`registration_number = $${queryIndex++}`);
    updateValues.push(registration_number);
  }
  if (adhaar_number) {
    updateFields.push(`adhaar_number = $${queryIndex++}`);
    updateValues.push(adhaar_number);
  }
  if (pan_number) {
    updateFields.push(`pan_number = $${queryIndex++}`);
    updateValues.push(pan_number);
  }
  if (gst_number) {
    updateFields.push(`gst_number = $${queryIndex++}`);
    updateValues.push(gst_number);
  }
  if (phone_number) {
    updateFields.push(`phone_number = $${queryIndex++}`);
    updateValues.push(phone_number);
  }

  // Add updated_on field
  updateFields.push(`updated_on = NOW()`);

  const updateUserQuery = `
    UPDATE "${tableName}"
    SET ${updateFields.join(', ')}
    WHERE user_id = $${queryIndex}
    RETURNING *
  `;

  updateValues.push(user_id);

  // Execute the update query
  const result = await db.query(updateUserQuery, updateValues);

  // Check if the user was updated
  if (result.rowCount === 0) {
    return res.status(404).send({ msg: 'User not found or no changes made', sts: "FAILED", success: false });
  }

  // Extract the updated user details from the result
  const updatedUser = result.rows[0];

  // Prepare the response
  const response = {
    msg: 'User information updated successfully',
    sts: "SUCCESS",
    success: true,
    user: updatedUser
  };

  return res.status(200).send(response);
});

module.exports = editUserInfoController;
