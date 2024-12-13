const { validationResult, check } = require('express-validator');
const db = require('../../../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');

// Validation rules for manager login
const managerLoginValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').notEmpty().withMessage('Password is required')
];

// Manager Login Controller
const loginManagerController = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array(), success: false });
  }

  // Destructure email and password from request body
  const { email, password } = req.body;

  try {
    // Check if the email exists in authentication table with registered_as manager
    const { rows: authRows } = await db.query('SELECT * FROM authentication WHERE email = $1 AND registered_as = $2', [email, 'manager']);
    if (authRows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials. Please check your email and password.', success: false });
    }
    
    // Check if email_verified_at is set
    if (!authRows[0].email_verified_at) {
      return res.status(400).json({ msg: 'Please verify your email before logging in.', is_email_verified: false, success: false });
    }

    // Check if temp_password is set
    if (authRows[0].temp_password) {
      return res.status(400).json({ msg: 'Please set a new password before logging in.', success: false, temp_pass_verified:true });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, authRows[0].password);
    if (!isPasswordMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. Please check your email and password.', success: false });
    }




    // Update last login timestamp
    await db.query('UPDATE authentication SET last_login_at = NOW() WHERE user_id = $1', [authRows[0].user_id]);

    // Fetch user details
    const { rows: userRows } = await db.query('SELECT first_name, last_name, company_name, tag_id FROM manager WHERE user_id = $1', [authRows[0].user_id]);

        // Generate JWT token
     const token = jwt.sign({ user_id: authRows[0].user_id, login_as: "manager", email: email, tag_id:userRows[0].tag_id }, process.env.JWT_SECRET, { expiresIn: '72h' });

    // Return success message with user details
    return res.status(200).json({
      msg: 'Manager logged in successfully.',
      token,
      success: true,
      is_email_verified: true,
      login_as: "manager",
      data: {
        email: authRows[0].email,
        first_name: userRows[0].first_name,
        last_name: userRows[0].last_name,
        user_id: authRows[0].user_id,
        company_name: userRows[0].company_name,
        tag_id: userRows[0].tag_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ msg: 'Login failed. Please try again later.', success: false });
  }
});

module.exports = { loginManagerController, managerLoginValidationRules };
