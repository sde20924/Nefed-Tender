const axios = require('axios');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const editUserInfoController = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.user;
  const {
    first_name,
    last_name,
    company_name,
    registration_number,
    adhaar_number,
    pan_number,
    gst_number,
    phone_number,
  } = req.body;

  // Validation: Ensure at least one field is provided for update
  if (!first_name && !last_name && !company_name && !registration_number && !adhaar_number && !pan_number && !gst_number && !phone_number) {
    return res.status(400).send({ msg: 'At least one field must be provided for update', sts: "FAILED", success: false });
  }

  try {
    const apiUrl = 'https://tender-auth-module.nafedtrackandtrace.com/taqw-yvsu';

    // Prepare payload for the external API
    const payload = {
      user_id,
      login_as,
      first_name,
      last_name,
      company_name,
      registration_number,
      adhaar_number,
      pan_number,
      gst_number,
      phone_number,
    };

    // Call the external API
    const apiResponse = await axios.put(apiUrl, payload);

    if (!apiResponse.data || !apiResponse.data.success) {
      throw new Error(apiResponse.data.message || 'Failed to update user info via external API');
    }

    // Prepare the response
    return res.status(200).send({
      msg: 'User information updated successfully via external API',
      sts: "SUCCESS",
      success: true,
      data: apiResponse.data,
    });
  } catch (error) {
    console.error('Error updating user info via external API:', error.message);
    return res.status(500).send({
      msg: 'Error updating user info via external API',
      error: error.message,
      success: false,
    });
  }
});

module.exports = editUserInfoController;
