const { validationResult, check } = require('express-validator');
const db = require('../../../config/config');
const bcrypt = require('bcrypt');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');
const sendOtpEmail = require('../../../utils/sentEmail');
const { extractFieldName, uniqueFieldMessages } = require('../../../utils/uniqueFieldMessage');

// Validation rules for manager registration
const managerValidationRules = [
  check('first_name').notEmpty().withMessage('First name is required'),
  check('last_name').notEmpty().withMessage('Last name is required'),
  check('company_name').optional().isString().withMessage('Company must be a string'),
  check('registration_number').optional().isString().withMessage('Registration number must be a string'),
  check('gst_number').notEmpty().withMessage('GST number is required')
    .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters long'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('phone_number').notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Phone number is invalid'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('created_by').optional().isInt().withMessage('created_by must be an integer'),
  check('logged_in_as').optional().isIn(['buyer', 'seller', 'admin', 'manager']).withMessage('logged_in_as must be one of: buyer, seller, admin, manager')
];

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Manager Registration Controller
const registerManagerController = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array(), success: false });
  }

  // Destructure fields from request body
  const { first_name, last_name, company_name, registration_number, gst_number, email, phone_number, password, created_by, logged_in_as } = req.body;

  // Check if manager with the same email or phone number already exists
  const existingManagerQuery = `
    SELECT * FROM manager WHERE email = $1 OR phone_number = $2
  `;
  const { rows: existingManagerRows } = await db.query(existingManagerQuery, [email, phone_number]);

  if (existingManagerRows.length > 0) {
    return res.status(400).json({ msg: 'A manager already exists with the provided email or phone number', success: false, is_already_exists: true, existedManager: existingManagerRows });
  }

  // Determine if temp_password should be used
  const tempPassword = created_by ? await bcrypt.hash(password, 10) : null;
  const actualPassword = created_by ? null : await bcrypt.hash(password, 10); // Hash password if not using temp_password

  // Check if created_by is provided and validate conditions
  if (created_by) {
    // Check if logged_in_as is provided and validate its role
    if (!logged_in_as) {
      return res.status(400).json({ msg: 'When created_by is provided, logged_in_as must be specified', success: false });
    }

    // Check if logged_in_as is manager
    if (logged_in_as === 'manager') {
      return res.status(400).json({ msg: 'A manager cannot create another manager.', success: false });
    }

    // Check if created_by and logged_in_as exist in authentication table with correct role and email verification
    const { rows: authRows } = await db.query('SELECT * FROM authentication WHERE user_id = $1 AND registered_as = $2', [created_by, logged_in_as]);
    if (authRows.length === 0 || !authRows[0].email_verified_at) {
      return res.status(400).json({ msg: 'You are not authorized to create a manager. Only verified buyers, sellers, or admins can perform this action.', success: false });
    }
  }

  // Generate OTP
  const otp = generateOTP();

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Insert into authentication table
    const authQuery = `
      INSERT INTO "authentication" (email, password, temp_password, otp, created_on_date, registered_as)
      VALUES ($1, $2, $3, $4, NOW(), 'manager')
      RETURNING user_id
    `;
    const { rows: authRows } = await db.query(authQuery, [email, actualPassword, tempPassword, otp]);
    const userId = authRows[0].user_id;

    // Insert into manager table
    const managerQuery = `
      INSERT INTO "manager" (user_id, first_name, last_name, company_name, registration_number, gst_number, email, phone_number, created_by, created_on, updated_on)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *
    `;
    const managerValues = [userId, first_name, last_name, company_name, registration_number, gst_number, email, phone_number, created_by || null];
    const createdManager = await db.query(managerQuery, managerValues);
    const managerId = createdManager.rows[0].manager_id;

    // If created_by is provided, update user_manager_assignments table
    if (created_by) {
      const assignmentQuery = `
        INSERT INTO user_manager_assignments (user_id, manager_id, assigned_by, manage_as)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(assignmentQuery, [userId, managerId, created_by, logged_in_as]);
    }

    // Send OTP email
    await sendOtpEmail(email, otp, 'Registration');

    // Commit the transaction
    await db.query('COMMIT');

    return res.status(200).send({ msg: 'Manager registered successfully. Please verify email with the sent OTP', success: true, created_by_self: created_by ? false : true, userDetails: createdManager.rows[0] });
  } catch (error) {
    // Rollback the transaction if an error occurs
    await db.query('ROLLBACK');
    console.error('Transaction error:', error);
    if (error.code === '23505') {
      const constraint = extractFieldName(error.detail);
      const userFriendlyMessage = uniqueFieldMessages[constraint] || 'A unique constraint violation occurred. Please ensure that all unique fields are unique.';
      return res.status(400).send({ msg: userFriendlyMessage, success: false });
    }
    return res.status(500).send({ msg: error.message, success: false });
  }
});

module.exports = { registerManagerController, managerValidationRules };
