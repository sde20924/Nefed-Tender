const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handler middleware

const getManagerList = asyncErrorHandler(async (req, res) => {
  // SQL query to fetch manager data
  const query = `
    SELECT user_id, first_name, last_name, email, phone_number, created_on
    FROM manager
  `;

  try {
    // Execute the query
    const [rows] = await db.execute(query);

    // Send the result as a response
    res.status(200).json({ sellerData: rows, success: true });
  } catch (error) {
    console.error("Error fetching manager list:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch manager list", error: error.message });
  }
});

module.exports = { getManagerList };
