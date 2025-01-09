import db from "../../../../config/config2.js"; // Import database connection
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

export const deleteTenderController = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // SQL query to delete tender by tender_id
    const deleteQuery = "DELETE FROM manage_tender WHERE tender_id = ?";

    // Execute the query with the tender_id parameter
    const [result] = await db.execute(deleteQuery, [id]);

    // If no rows were affected, it means the tender was not found
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, msg: "Tender not found" });
    }

    res.status(200).json({ success: true, msg: "Tender deleted successfully" });
  } catch (error) {
    console.error("Error deleting tender:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete tender",
      error: error.message,
    });
  }
});

module.exports = { deleteTenderController };
