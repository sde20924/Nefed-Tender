import db from "../../config/config2.js";

export const announceWinner = async (req, res) => {
  try {
    const { tender_id } = req.params;
    const { winner_user_id, qty_secured, round, status } = req.body;

    // Validate required fields
    if (!tender_id || !winner_user_id || !qty_secured || !round || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields." 
      });
    }

    // Update the tender_bid_room table to mark the winner
    const updateQuery = `
      UPDATE tender_bid_room
      SET status = ?,
          qty_secured = ?,
          round = ?
      WHERE tender_id = ? AND user_id = ?;
    `;
    const values = [status, qty_secured, round, tender_id, winner_user_id];

    // Execute the update query
    const [result] = await db.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No bid found for the given tender and user." 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Winner announced successfully." 
    });
  } catch (error) {
    console.error("Error announcing winner:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
};
