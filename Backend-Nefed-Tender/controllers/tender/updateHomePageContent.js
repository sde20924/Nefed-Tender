const db = require('../../config/config'); 

// Function to insert homepage content
const updateHomepageContent = async (req, res) => {
    // Destructuring title, subheading, and description from req.body
    const { title, subheading, description } = req.body;
    console.log("Incoming data:", title, subheading, description);

    try {
        // Perform the insert query
        await db.query(
            'INSERT INTO homepage_content (title, subheading, description) VALUES ($1, $2, $3)',
            [title, subheading, description]
        );
        
        // Send a success response back to the client
        res.json({ message: 'Homepage content inserted successfully' });
    } catch (error) {
        console.error('Error inserting homepage content:', error.message);
        res.status(500).json({ error: 'Error inserting homepage content: ' + error.message });
    }
};

module.exports = { updateHomepageContent };
