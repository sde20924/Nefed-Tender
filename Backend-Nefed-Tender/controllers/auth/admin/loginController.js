const { validationResult, check } = require('express-validator');
const db = require('../../../config/config');
const bcrypt = require('bcrypt');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');

// Validation rules for admin login
const adminLoginValidationRules = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').notEmpty().withMessage('Password is required')
];

// Admin Login Controller
const adminLoginController = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }

  // Destructure fields from request body
  const { email, password } = req.body;

  try {
    // Check if authentication record exists for the email and join with admin table
    const { rows } = await db.query(
      `SELECT a.user_id, a.email, a.password, a.registered_as, u.first_name, u.last_name, u.admin_id, tag_id
       FROM authentication a
       JOIN admin u ON a.user_id = u.user_id
       WHERE a.email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Admin not found.', success: false });
    }

    // Verify password
    const auth = rows[0];
    const passwordMatch = await bcrypt.compare(password, auth.password);
    if (!passwordMatch) {
      return res.status(401).json({ msg: 'Invalid password.', success: false });
    }

    // Check if registered_as is 'admin'
    if (auth.registered_as !== 'admin') {
      return res.status(401).json({ msg: 'You are not authorized to log in as admin.', success: false });
    }

    const token = jwt.sign({ user_id: auth.user_id, email: auth.email, login_as: "admin", tag_id: auth.tag_id }, process.env.JWT_SECRET, { expiresIn: '72h' });

    // Return success response
    return res.status(200).json({
      msg: 'Admin logged in successfully.',
      success: true,
      token: token,
      login_as: "admin",
      data: {
        email: auth.email,
        first_name: auth.first_name,
        last_name: auth.last_name,
        company_name: auth.company_name,
        admin_id: auth.admin_id,
        user_id: auth.user_id,
        tag_id: auth.tag_id
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return res.status(500).json({ msg: 'Internal server error.', success: false });
  }
});

module.exports = { adminLoginController, adminLoginValidationRules };
