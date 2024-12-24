const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');
const generateUserToken = require('../../../utils/generateToken');

const switchUser = asyncErrorHandler(async (req, res) => {
    const { user_id, login_as } = req.params;

    if (!['buyer', 'seller', 'manager'].includes(login_as)) {
        return res.status(400).json({ msg: 'Invalid user role', success: false });
    }

    // Verify the user exists in the specified role table
    const userQuery = `SELECT * FROM "${login_as}" WHERE user_id = $1`;
    const userResult = await db.query(userQuery, [user_id]);
    if (userResult.rows.length === 0) {
        return res.status(404).json({ msg: 'User not found', success: false });
    }

    const user = userResult.rows[0];
  

    // Generate a token for the user
    const token = generateUserToken(user.user_id, login_as, user.email);

    const responseData = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_id: user.user_id,
        company_name: user.company_name
    };

    const responseMessage = `Admin - ${login_as.charAt(0).toUpperCase() + login_as.slice(1)} logged in successfully`;

    return res.status(200).json({
        msg: responseMessage,
        token,
        success: true,
        is_email_verified: true, // Assuming email is verified for switched user
        login_as,
        data: responseData
    });
});

module.exports = switchUser;
