import axios from 'axios';

const getUserInfo = async (req, res) => {
    const { user_id, login_as } = req.user;

    try {
        const externalApiPayload = {
            required_keys: 'user_id, email, phone_number, company_name',
            user_ids: [
                { type: login_as, user_id: parseInt(user_id, 10) },
            ],
        };

        const externalApiEndpoint = 'https://tender-auth-module.nafedtrackandtrace.com/taqw-yvsu';
        const externalApiResponse = await axios.post(externalApiEndpoint, externalApiPayload);

        // Check if the API response is valid
        const apiUserData = externalApiResponse.data?.data || [];
        if (!Array.isArray(apiUserData)) {
            throw new Error("Invalid API response format: 'data' is not an array");
        }

        const userDetails = apiUserData.find(user => user.user_id === parseInt(user_id, 10)) || {};
        if (!userDetails) {
            return res.status(404).json({ msg: "User not found in external API", success: false });
        }

        // Mock managers and documents for response
        const managers = []; 
        const userDocuments = []; 

        res.status(200).json({
            userDetails: { ...userDetails, userDocuments },
            managers,
            msg: "User details fetched successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Error fetching user info',
            error: error.message,
            success: false,
        });
    }
};

export default getUserInfo;
