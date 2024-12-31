const db = require('../../config/config'); // MySQL database connection

const getHomepageContent = async (req, res) => {
  try {
    // Selecting the last row based on the primary key (id)
    const query = 'SELECT * FROM homepage_content ORDER BY id DESC LIMIT 1';
    const [rows] = await db.execute(query); // Execute the query using MySQL connection

    if (rows.length > 0) {
      // Return the first (latest) row
      return res.send({ data: rows[0], success: true });
    } else {
      return res.send({ msg: 'No data found', success: false });
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error.message);
    return res.send({ msg: error.message, success: false });
  }
};

module.exports = { getHomepageContent };
