const db = require("../../config/config"); // MySQL database connection
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Error handling middleware

const getBuyerList = asyncErrorHandler(async (req, res) => {
  // Query to fetch the buyer list
  const query = `
    SELECT user_id, first_name, last_name, email, phone_number, created_on 
    FROM buyer
  `;

  try {
    // Execute the query and get the result
    const [rows] = await db.execute(query); // Using `execute` for parameterized queries
    // Respond with the fetched data
    res.status(200).json({ buyerData: rows, success: true });
  } catch (error) {
    console.error("Error fetching buyer list:", error);
    res.status(500).json({ success: false, msg: "Failed to fetch buyer list", error: error.message });
  }
});

module.exports = { getBuyerList };
