const { validationResult, check } = require('express-validator');
const db = require('../../../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

// Validation rules for buyer login
const buyerLoginValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').notEmpty().withMessage('Password is required')
];

// Buyer Login Controller
const buyerLoginController = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array(), success: false });
  }

  // Destructure fields from request body
  const { email, password } = req.body;

  try {
    // Check if the email exists in the authentication table
    const { rows: authRows } = await db.query('SELECT * FROM "authentication" WHERE email = $1 AND registered_as = $2', [email, 'buyer']);
    if (authRows.length === 0) {
      return res.status(404).json({ msg: 'Email or password is incorrect', success: false });
    }

    // Check email verification status
    if (!authRows[0].email_verified_at) {
      return res.status(400).json({ msg: 'Please verify your email before logging in', is_email_verified: false, success: false });
    }

    // Check password conditions
    if (!authRows[0].temp_password && authRows[0].password && authRows[0].email_verified_at) {
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, authRows[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Email or password is incorrect', success: false });
      }

      
      // Update last login timestamp
      await db.query('UPDATE "authentication" SET last_login_at = NOW() WHERE user_id = $1', [authRows[0].user_id]);
      
      // Fetch user details
      const { rows: userRows } = await db.query('SELECT first_name, last_name, company_name, tag_id, status FROM buyer WHERE user_id = $1', [authRows[0].user_id]);
      if (userRows.length === 0) {
        console.error('No user details found for user_id:', authRows[0].user_id);
        return res.status(500).json({ msg: 'User details not found', success: false });
      }

      console.log('userRows', userRows);
      // Generate JWT token
      const token = jwt.sign({ user_id: authRows[0].user_id, login_as: "buyer", email: email, tag_id: userRows[0].tag_id }, process.env.JWT_SECRET, { expiresIn: '72h' });
      
      return res.status(200).json({
        msg: "Buyer logged in successfully",
        token,
        success: true,
        is_email_verified: true,
        login_as: "buyer",
        data: {
          email: authRows[0].email,
          first_name: userRows[0].first_name,
          last_name: userRows[0].last_name,
          user_id: authRows[0].user_id,
          company_name: userRows[0].company_name,
          tag_id: userRows[0].tag_id,
          status: userRows[0].status
        },
      });
    } else if (authRows[0].temp_password) {
      return res.status(400).json({ msg: 'Please set a new password before logging in.', success: false, temp_pass_verified: true });
    } else {
      return res.status(400).json({ msg: 'Invalid login attempt', success: false });
    }
  } catch (error) {
    console.error('Buyer login error:', error);
    return res.status(500).json({ msg: 'Internal server error', success: false });
  }
});

module.exports = { buyerLoginController, buyerLoginValidationRules };