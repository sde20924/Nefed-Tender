// controllers/tenderApplicationController.js

const db = require("../../config/config"); // Adjust to the path where your database connection is defined
const { emitEvent } = require("../../socket/event/emit");
const { userVerifyApi } = require("../../utils/external/api");
const axios = require("axios");

// Controller to update tender application
const updateTenderApplicationBySeller = async (req, res) => {
  const { applicationId, action, reason } = req.body;

  try {
    // Query to check if the tender application exists
    const checkQuery =
      "SELECT * FROM tender_application WHERE tender_application_id = ?";
    const [checkResult] = await db.query(checkQuery, [applicationId]);

    if (checkResult.length === 0) {
      return res.status(404).json({ message: "Tender application not found" });
    }

    // Prepare the SQL query to update the tender application
    const updateQuery = `
            UPDATE tender_application 
            SET status = ?, rejected_reason = ? 
            WHERE tender_application_id = ?`;
    const values = [
      action,
      action === "rejected" ? reason : null,
      applicationId,
    ];

    // Execute the update query
    const [updateResult] = await db.query(updateQuery, values);

    if (updateResult.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Failed to update tender application" });
    }

    // Retrieve the updated record to return in the response
    const [updatedRecord] = await db.query(
      "SELECT * FROM tender_application WHERE tender_application_id = ?",
      [applicationId]
    );

    //buyer Details
    const token = req.headers["authorization"];

    const sellerDetailsResponse = await axios.post(
      userVerifyApi + "taqw-yvsu",
      {
        required_keys: "*",
        user_ids: [
          {
            type: "seller",
            user_id: req.user?.user_id,
          },
        ],
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    emitEvent(
      "Application-status",
      {
        message: `Your Application ${action.toUpperCase()} By ${
          sellerDetailsResponse?.data?.data[0]?.company_name
        }`,
        seller_id: req.user.user_id,
        company_name: sellerDetailsResponse?.data?.data[0]?.company_name,
        tender_id: updatedRecord[0]?.tender_id,
        action_type: "Application-status",
      },
      "buyer",
      updatedRecord[0]?.user_id
    );

    res.status(200).json({
      message: "Tender application updated successfully",
      tenderApplication: updatedRecord[0],
    });
  } catch (error) {
    console.error("Error updating tender application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  updateTenderApplicationBySeller,
};
