const { check, validationResult } = require('express-validator');
const db = require('../../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');


// Define the validation checks for setting new password
const setNewPassValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('otp').optional().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters long'),
  check('temp_password').optional().isLength({ min: 6 }).withMessage('Temporary password must be at least 6 characters long'),
  check('user_type').isIn(['buyer', 'seller', 'manager']).withMessage('User type must be one of: buyer, seller, manager')
];

// Set New Password Controller
const setNewPassword = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }

  const { email, otp, temp_password, password, user_type } = req.body;

  let userId;

  // Check if OTP is provided
  if (otp) {
    // Verify OTP
    const verifyOTPQuery = `
      SELECT u.user_id, a.temp_password, a.email_verified_at
      FROM ${user_type} u
      JOIN authentication a ON u.user_id = a.user_id
      WHERE u.email = $1 AND a.otp = $2 AND a.registered_as = $3
    `;
    const { rows } = await db.query(verifyOTPQuery, [email, otp, user_type]);

    if (rows.length === 0) {
      return res.status(400).send({ msg: 'Invalid OTP or Email', success: false, is_email_verified: false });
    }

    const user = rows[0];
    userId = user.user_id;

    // Check if email_verified_at is empty and update it
    if (!user.email_verified_at) {
      const updateVerificationQuery = `
        UPDATE authentication
        SET email_verified_at = NOW()
        WHERE user_id = $1 AND registered_as = $2
      `;
      await db.query(updateVerificationQuery, [userId, user_type]);
    }
  } else if (temp_password) {
    // OTP not provided, verify with temp_password
    const verifyTempPasswordQuery = `
      SELECT u.user_id, a.temp_password, a.email_verified_at
      FROM ${user_type} u
      JOIN authentication a ON u.user_id = a.user_id
      WHERE u.email = $1 AND a.registered_as = $2
    `;
    const { rows } = await db.query(verifyTempPasswordQuery, [email, user_type]);

    if (rows.length === 0) {
      return res.status(400).send({ msg: 'Invalid Email', success: false, is_email_verified: false });
    }

    const user = rows[0];
    userId = user.user_id;

    // Check if email_verified_at is empty
    if (!user.email_verified_at) {
      return res.status(400).send({ msg: 'Please verify email first', success: false, is_email_verified: false });
    }

    // Check if temp_password matches
    const isTempPasswordValid = await bcrypt.compare(temp_password, user.temp_password);
    if (!isTempPasswordValid) {
      return res.status(400).send({ msg: 'Invalid temporary password', success: false });
    }
  } else {
    return res.status(400).send({ msg: 'OTP or Temporary password is required', success: false, is_email_verified: false });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password in authentication table
  const updatePasswordQuery = `
    UPDATE authentication
    SET password = $1, temp_password = NULL, otp = NULL
    WHERE user_id = $2 AND registered_as = $3
  `;
  await db.query(updatePasswordQuery, [hashedPassword, userId, user_type]);

  return res.status(200).send({ msg: 'Password updated successfully', success: true, is_email_verified: true });
});



module.exports = {setNewPassword, setNewPassValidationRules,  };
