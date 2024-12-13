const { validationResult, check } = require('express-validator');
const db = require('../../../config/config');
const bcrypt = require('bcrypt');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');
const sendOtpEmail = require('../../../utils/sentEmail');
const { extractFieldName, uniqueFieldMessages } = require('../../../utils/uniqueFieldMessage');

// Validation rules for buyer registration
const buyerValidationRules = [
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
  check('created_by').optional().isInt().withMessage('created_by must be an integer')
];

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Buyer Registration Controller
const registerBuyerController = asyncErrorHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }

  // Destructure fields from request body
  const { first_name, last_name, company_name, registration_number, gst_number, email, phone_number, password, created_by } = req.body;

  // Check if the created_by value exists in the admin table
  if (created_by) {
    const { rows: adminRows } = await db.query('SELECT admin_id FROM admin WHERE admin_id = $1', [created_by]);
    if (adminRows.length === 0) {
      return res.status(400).json({ msg: 'You are not authorized to create a buyer. Only admin can perform this action.', success: false });
    }
  }

  // Check if email is already registered
  const { rows: existingBuyerRowsByEmail } = await db.query('SELECT user_id FROM "buyer" WHERE email = $1', [email]);
  if (existingBuyerRowsByEmail.length > 0) {
    return res.status(400).json({ msg: 'Email is already registered as a buyer', success: false });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = generateOTP();

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Insert into authentication table
    const authQuery = created_by ?
      `INSERT INTO "authentication" (email, temp_password, otp, created_on_date, registered_as)
       VALUES ($1, $2, $3, NOW(), 'buyer')
       RETURNING user_id` :
      `INSERT INTO "authentication" (email, password, otp, created_on_date, registered_as)
       VALUES ($1, $2, $3, NOW(), 'buyer')
       RETURNING user_id`;

    const { rows: authRows } = await db.query(authQuery, [email, hashedPassword, otp]);
    const userId = authRows[0].user_id;

    // Insert into buyer table
    const buyerQuery = `
      INSERT INTO "buyer" (user_id, first_name, last_name, company_name, registration_number, gst_number, email, phone_number, created_by, created_on, updated_on)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *
    `;
    const buyerValues = [userId, first_name, last_name, company_name, registration_number, gst_number, email, phone_number, created_by || null];

    const createdBuyer = await db.query(buyerQuery, buyerValues);

    // Send OTP email
    await sendOtpEmail(email, otp, 'Registration');

    // Commit the transaction
    await db.query('COMMIT');

    return res.status(200).send({ msg: 'Buyer registered successfully. Please verify email with the sent OTP', success: true, created_by_self: created_by ? false : true, userDetails: createdBuyer.rows[0] });
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

module.exports = { registerBuyerController, buyerValidationRules };
