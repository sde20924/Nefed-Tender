const db = require('../../config/config'); // Database configuration

// Controller function to handle file URL submission with conditional updates and check for duplicates
const submitFileUrl = async (req, res) => {
    const { tender_id, file_url, status, tender_user_doc_id = null } = req.body;
    const { user_id } = req.user; // Assuming 'req.user' contains authenticated user details

    try {
        await db.query("START TRANSACTION"); // Start transaction

        // Check if the user already has an application for this specific tender
        const [existingApp] = await db.query(
            `SELECT tender_application_id FROM tender_application 
             WHERE tender_id = ? AND user_id = ?`,
            [tender_id, user_id]
        );

        let tender_application_id;
        if (existingApp.length > 0) {
            // If the user has already applied, get the existing tender_application_id
            tender_application_id = existingApp[0].tender_application_id;

            // Update the application status
            await db.query(
                `UPDATE tender_application SET status = ? WHERE tender_application_id = ? AND user_id = ?`,
                [status, tender_application_id, user_id]
            );
        } else {
            // If no existing application for the user, create a new one
            const [insertResult] = await db.query(
                `INSERT INTO tender_application (tender_id, user_id, status)
                 VALUES (?, ?, ?)`,
                [tender_id, user_id, status]
            );

            if (insertResult.affectedRows === 0) {
                throw new Error('Failed to insert tender application');
            }

            tender_application_id = insertResult.insertId;
        }

        // Process each file URL for this user's tender application
        for (const file of file_url) {
            const { tender_doc_id, doc_url } = file;

            if (tender_user_doc_id) {
                // Update existing document URL if tender_user_doc_id is provided
                await db.query(
                    `UPDATE tender_user_doc SET doc_url = ? WHERE tender_user_doc_id = ?`,
                    [doc_url, tender_user_doc_id]
                );
            } else {
                // Insert new document if no tender_user_doc_id is provided
                await db.query(
                    `INSERT INTO tender_user_doc (tender_application_id, tender_id, user_id, tender_doc_id, doc_url)
                     VALUES (?, ?, ?, ?, ?)`,
                    [tender_application_id, tender_id, user_id, tender_doc_id, doc_url]
                );
            }
        }

        await db.query("COMMIT"); // Commit transaction
        res.status(201).json({ msg: 'File URLs processed successfully', success: true });
    } catch (error) {
        await db.query("ROLLBACK"); // Roll back the transaction in case of an error
        console.error('Error processing file URLs:', error.message);
        res.status(500).json({ msg: 'Error processing file URLs', success: false });
    }
};

module.exports = {  
    submitFileUrl,
};
