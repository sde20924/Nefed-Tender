const db = require('../../config/config');
const asyncErrorHandler = require('../../utils/asyncErrorHandler');

const getAllManagers = asyncErrorHandler(async (req, res) => {
    const { user_id } = req.user;

    const assignmentsQuery = `
        SELECT manager_id
        FROM user_manager_assignments
        WHERE assigned_by = $1
    `;

    try {
        const { rows: assignments } = await db.query(assignmentsQuery, [user_id]);

        if (assignments.length === 0) {
            return res.status(404).json({ msg: 'No managers assigned by the logged-in user', success: false });
        }

        console.log("assignments",assignments);

        const managerIds = assignments.map(assignment => assignment.manager_id);
        
        const managersQuery = `
            SELECT manager_id, first_name, last_name, email, user_id, created_by, phone_number
            FROM manager
            WHERE manager_id = ANY($1) AND is_blocked = false
            ORDER BY first_name ASC
        `;
        
        const { rows: managers } = await db.query(managersQuery, [managerIds]);

        if (managers.length === 0) {
            return res.status(404).json({ msg: 'No managers found for the given assignments', success: false });
        }

        return res.status(200).json({ success: true, msg: 'Managers fetched successfully', data: managers });
    } catch (error) {
        console.error('Error fetching managers:', error);
        return res.status(500).json({ msg: 'Internal server error', success: false });
    }
});

module.exports = getAllManagers;
