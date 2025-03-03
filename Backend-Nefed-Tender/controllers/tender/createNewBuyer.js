const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");

const createNewBuyerController = asyncErrorHandler(async (req, res) => {
  const user_id = req.user?.user_id;
  const { demo_tender_sheet_id, buyer_id } = req.body;

  // Validation to ensure required fields are provided
  const missingFields = [];
  if (!user_id) missingFields.push("seller_id is required");
  if (!buyer_id) missingFields.push("buyer_id is required");
  if (!demo_tender_sheet_id)
    missingFields.push("demo_tender_sheet_id is required");

  if (missingFields.length > 0) {
    return res.status(400).json({ msg: "Validation Error", missingFields });
  }

  try {
    // Insert the new Buyer data into the `seller_buyer` table
    const [newBuyer] = await db.query(
      `INSERT INTO seller_buyer (
          seller_id, buyer_id, demo_tender_sheet_id
        ) VALUES (?, ?, ?)`,
      [user_id, buyer_id, demo_tender_sheet_id]
    );

    res.status(201).json({
      success: true,
      msg: "Buyer created successfully",
      seller_buyer_id: newBuyer.insertId,
    });
  } catch (error) {
    console.error("Error creating Buyer:", error.message);
    res.status(500).json({
      msg: "Error creating Buyer",
      error: error.message,
    });
  }
});

module.exports = createNewBuyerController;
