const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const getManagerDetails = asyncErrorHandler(async (req, res) => {
    const manager_id = req.params.manager_id;
    const {user_id} = req.user

    const query = `
    SELECT *
    FROM manager
    WHERE manager_id = $1 AND created_by = $2
    `;

    try {
        const { rows: managers } = await db.query(query, [manager_id, user_id]);

        if (managers.length === 0) {
            return res.status(404).json({ msg: 'Manager not found', success: false, data: {} });
        }

        const manager = managers[0]; 

        return res.status(200).json({ success: true, msg: 'Manager details fetched successfully', data: manager });
    } catch (error) {
        console.error('Error fetching manager details:', error);
        return res.status(500).json({ msg: 'Internal server error', success: false });
    }
});

module.exports = getManagerDetails;
