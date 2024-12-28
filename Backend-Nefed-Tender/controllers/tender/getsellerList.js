const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handler middleware

const getSellerList = asyncErrorHandler(async (req, res) => {
  // SQL query to fetch seller data
  const query = `
    SELECT seller_id, first_name, last_name, email, phone_number, created_on
    FROM seller
  `;

  try {
    // Execute the query
    const [rows] = await db.execute(query); // Use execute for parameterized queries

    // Send the result as a response
    res.status(200).json({ sellerData: rows, success: true });
  } catch (error) {
    console.error("Error fetching seller list:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch seller list", error: error.message });
  }
});

module.exports = { getSellerList };
