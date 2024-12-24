const db = require('../../config/config')
const asyncErrorHandler = require("../../utils/asyncErrorHandler");
const generateUniqueId = require('../../utils/generateUniqueId');

const createAudienceController = asyncErrorHandler(async (req, res) => {
    console.log("here")
    const { user_id } = req.user;
    const audience_id = generateUniqueId()
    console.log("data: ", user_id, audience_id)
    const { audience_name, user_type, audience } = req.body
    if(!audience_name || !user_type || !audience) {
        return res.status
    }

    return {
        sts: "SUCCESS"
    }
})

module.exports = createAudienceController