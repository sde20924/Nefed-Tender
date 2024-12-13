const db = require("../../config/config");

const announceWinner = async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { winner_user_id, qty_secured, round, status } = req.body;

    // Validate required fields
    if (!tender_id || !winner_user_id || !qty_secured || !round || !status) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Update the tender_bid_room table to mark the winner
    const updateQuery = `
      UPDATE tender_bid_room
      SET status = $1,
          qty_secured = $2,
          round = $3
      WHERE tender_id = $4 AND user_id = $5;
    `;
    const values = [status, qty_secured, round, tender_id, winner_user_id];

    const result = await db.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No bid found for the given tender and user." });
    }

    res.status(200).json({ success: true, message: "Winner announced successfully." });
  } catch (error) {
    console.error("Error announcing winner:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { announceWinner };    
