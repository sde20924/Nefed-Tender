import db from '../../config/config2.js'; // Ensure this is the correct path to your database configuration

export const updateTenderApplicationBySeller = async (req, res) => {
    const { applicationId, action, reason } = req.body;

    try {
        // Validate input
        if (!applicationId || !action) {
            return res.status(400).json({ message: 'Application ID and action are required' });
        }

        // Check if the tender application exists
        const checkQuery = 'SELECT * FROM tender_application WHERE tender_application_id = ?';
        const [checkResult] = await db.query(checkQuery, [applicationId]);

        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Tender application not found' });
        }

        // Prepare and execute the update query
        const updateQuery = `
            UPDATE tender_application 
            SET status = ?, rejected_reason = ? 
            WHERE tender_application_id = ?`;
        const values = [action, action === 'rejected' ? reason : null, applicationId];

        const [updateResult] = await db.query(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to update tender application' });
        }

        // Fetch the updated record
        const [updatedRecord] = await db.query(
            'SELECT * FROM tender_application WHERE tender_application_id = ?',
            [applicationId]
        );

        return res.status(200).json({ 
            message: 'Tender application updated successfully', 
            tenderApplication: updatedRecord[0] 
        });
    } catch (error) {
        console.error('Error updating tender application:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
