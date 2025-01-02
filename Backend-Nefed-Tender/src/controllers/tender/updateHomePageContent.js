import db from '../../config/config2.js'; // Import database connection

/**
 * Function to update homepage content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateHomepageContent = async (req, res) => {
  try {
    const { title, subheading, description } = req.body;

    // Validate required fields
    if (!title || !subheading || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, subheading, description) are required.",
      });
    }

    console.log("Incoming data:", { title, subheading, description });

    // Insert data into the database
    const query = `
      INSERT INTO homepage_content (title, subheading, description) 
      VALUES (?, ?, ?)
    `;
    await db.execute(query, [title, subheading, description]);

    // Send success response
    res.status(201).json({
      success: true,
      message: "Homepage content inserted successfully.",
    });
  } catch (error) {
    console.error("Error inserting homepage content:", error.message);

    // Send error response
    res.status(500).json({
      success: false,
      message: "Error inserting homepage content.",
      error: error.message,
    });
  }
};
