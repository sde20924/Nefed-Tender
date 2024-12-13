const { check, validationResult } = require('express-validator');
const db = require('../../config/config'); // Update with the correct path to your config
const sendOtpEmail = require('../../utils/sentEmail');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');


// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Define the validation checks for forgot password
const forgotPassValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('user_type').isIn(['buyer', 'seller', 'manager']).withMessage('User type must be one of: buyer, seller, manager')
];

// Forgot Password Controller
const forgotPassword = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }

  const { email, user_type } = req.body;

  // Check if the user exists in the authentication table with the given user_type
  const userQuery = `
    SELECT user_id, email
    FROM authentication
    WHERE email = $1 AND registered_as = $2
  `;
  const { rows } = await db.query(userQuery, [email, user_type]);

  if (rows.length === 0) {
    return res.status(400).send({ msg: 'User does not exist', success: false });
  }

  const user = rows[0];
  const userId = user.user_id;

  // Generate OTP
  const otp = generateOTP();

  // Update OTP in the authentication table
  const updateAuthQuery = `
    UPDATE authentication
    SET otp = $1
    WHERE user_id = $2 AND registered_as = $3
  `;
  await db.query(updateAuthQuery, [otp, userId, user_type]);

  // Send OTP to user's email
  await sendOtpEmail(email, otp, 'forgot-password');

  return res.status(200).send({ msg: 'OTP sent to your email for password reset', success: true });
});



module.exports = { forgotPassword, forgotPassValidationRules };
