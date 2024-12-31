import asyncErrorHandler from '../../utils/asyncErrorHandler.js';
import axios from 'axios';
import { userVerifyApi } from '../../utils/external/api.js';

const getUserInfo = asyncErrorHandler(async (req, res) => {
  const { user_id, login_as } = req.user;
  const validUserTypes = ['admin', 'buyer', 'seller', 'manager'];

  if (!validUserTypes.includes(login_as)) {
    return res.status(400).send({ msg: 'Invalid user type', sts: 'FAILED', success: false });
  }

  const token = req.headers['authorization']; 
  if (!token) {
    return res.status(401).send({ msg: 'Authorization token is missing', success: false });
  }

  try {
    const externalApiPayload = {
      required_keys: 'first_name,last_name,gst_number,user_id,email,phone_number,company_name',
      user_ids: [
        {
          type: login_as,
          user_id: parseInt(user_id, 10),
        },
      ],
    };

    const externalApiEndpoint = `${userVerifyApi}taqw-yvsu`;
    const externalApiResponse = await axios.post(externalApiEndpoint, externalApiPayload, {
      headers: {
        Authorization: token, // Pass the token in the headers
      },
    });

    if (!externalApiResponse.data || !externalApiResponse.data.success) {
      throw new Error('Failed to fetch data from external API');
    }

    const externalUserData = externalApiResponse.data.data.find(
      (user) => user.user_id === parseInt(user_id, 10)
    );

    if (!externalUserData) {
      return res.status(404).send({ msg: 'User data not found in external API', success: false });
    }

    // Extract required fields
    const userDetails = {
      user_id: externalUserData.user_id,
      first_name: externalUserData.first_name,
      last_name: externalUserData.last_name,
      email: externalUserData.email || '',
      gst_number: externalUserData.gst_number,
      phone_number: externalUserData.phone_number || '',
      company_name: externalUserData.company_name || '',
    };

    return res.status(200).send({
      userDetails,
      msg: 'User details fetched successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    return res.status(500).send({
      msg: 'Error fetching user info',
      error: error.message,
      success: false,
    });
  }
});

export default getUserInfo;
