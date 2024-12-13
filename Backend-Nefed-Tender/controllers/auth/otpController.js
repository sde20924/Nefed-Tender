const { check, validationResult } = require('express-validator');
const db = require('../../config/config'); // Update with the correct path to your config
const sendOtpEmail = require('../../utils/sentEmail');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET

// Define the validation checks
const resendOtpValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
];
const otpValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long'),
  check('login_as').optional().isIn(['buyer', 'seller', 'manager']).withMessage('login_as must be one of: buyer, seller, manager')
];


 const verifyOtp = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array(), success: false });
  }

  const { email, otp, login_as } = req.body;

  // Verify OTP
  let verifyOTPQuery;
  if (login_as) {
    verifyOTPQuery = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, a.email_verified_at, u.tag_id, u.status
      FROM ${login_as} u
      JOIN authentication a ON u.user_id = a.user_id
      WHERE u.email = $1 AND a.otp = $2 AND a.registered_as = $3
    `;
  } else {
    verifyOTPQuery = `SELECT email, user_id, email_verified_at FROM authentication WHERE email = $1 AND otp = $2`;
  }

  const { rows } = await db.query(verifyOTPQuery, login_as ? [email, otp, login_as] : [email, otp]);

  if (rows.length === 0) {
    return res.status(400).send({ msg: 'Invalid OTP or Email', success: false });
  }

  const user = rows[0];

  // Check if email is already verified
  if (!user.email_verified_at) {
    // Update email_verified_at timestamp for all records with the same email
    const updateEmailVerifiedQuery = `
      UPDATE authentication
      SET email_verified_at = NOW(), otp = NULL
      WHERE email = $1
    `;
    await db.query(updateEmailVerifiedQuery, [email]);
  } else {
    // Clear the OTP only if email is already verified for all records with the same email
    const clearOtpQuery = `
      UPDATE authentication
      SET otp = NULL
      WHERE email = $1
    `;
    await db.query(clearOtpQuery, [email]);
  }

  if (login_as) {
    // Generate JWT token
    const token = jwt.sign({ user_id: user.user_id, login_as, email: email, tag_id:user.tag_id }, process.env.JWT_SECRET, { expiresIn: '72h' });

    return res.status(200).send({
      token,
      login_as,
      msg: 'OTP verified successfully',
      success: true,
      data: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        company_name: user.company_name,
        user_id: user.user_id,
        tag_id: user.tag_id,
        status: user.status
      }
    });
  } else {
    return res.status(200).send({ msg: 'OTP verified successfully', success: true, sts: "SUCCESS" });
  }
});





const resendOtp = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array(), success: false });
  }

  // Destructure fields from request body
  const { email } = req.body;

  // Check if the user exists
  const userQuery = `SELECT user_id FROM authentication WHERE email = $1`;
  const userResult = await db.query(userQuery, [email]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({ msg: "User not found", success: false });
  }

  // Generate a new OTP
  const newOtp = generateOTP();

  // Update the OTP for all records associated with the email
  const updateOtpQuery = `UPDATE authentication SET otp = $1 WHERE email = $2`;
  await db.query(updateOtpQuery, [newOtp, email]);

  // Send the new OTP via email
  await sendOtpEmail(email, newOtp, '');

  return res.status(200).json({ msg: "OTP resent successfully", success: true });
});

module.exports = {  resendOtp, verifyOtp, resendOtpValidationRules, otpValidationRules };
