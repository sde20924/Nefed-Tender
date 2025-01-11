const db = require('../../config/config');
const axios = require("axios"); // For external API calls
const { userVerifyApi } = require("../../utils/external/api");
const getSubmittedTenderApplications = async (req, res) => {
  if (!req.user || !req.user.user_id) {
    return res
      .status(400)
      .send({ msg: "User not authenticated", success: false });
  }
  const { user_id } = req.user;
  try {
    // Query to fetch tenders created by the user
    const tenderIdsQuery = `
      SELECT tender_id, tender_title,category
      FROM manage_tender
      WHERE user_id = ?
    `;
    const [tenderIdsResult] = await db.execute(tenderIdsQuery, [user_id]);
    if (!tenderIdsResult.length) {
      return res
        .status(404)
        .send({ msg: "No tenders found for the user", success: false });
    }
    const tenderIds = tenderIdsResult.map((row) => row.tender_id);
    const placeholders = tenderIds.map(() => "?").join(",");
    // Query to fetch submitted applications for the user's tenders
    const applicationsQuery = `
      SELECT ta.*, mt.tender_title,mt.category
      FROM tender_application ta
      INNER JOIN manage_tender mt ON ta.tender_id = mt.tender_id
      WHERE ta.tender_id IN (${placeholders}) AND ta.status = 'submitted'
    `;
    const [applicationsResult] = await db.execute(applicationsQuery, tenderIds);
    if (!applicationsResult.length) {
      return res.status(404).send({
        msg: "No submitted applications found for the user tenders",
        success: false,
      });
    }
    // Prepare user IDs for external API payload
    const userIds = [
      ...new Set(applicationsResult.map((application) => application.user_id)),
    ]; // Remove duplicates
    console.log("User IDs for external API:", userIds);
    const externalApiPayload = {
      required_keys: "first_name,last_name,company_name,user_id, email",
      user_ids: userIds.map((user_id) => ({
        type: "buyer",
        user_id,
      })),
    };
    // Call external API to fetch buyer details
    const externalApiEndpoint = `${userVerifyApi}taqw-yvsu`;
    const token = req.headers["authorization"];
    const externalApiResponse = await axios.post(
      externalApiEndpoint,
      externalApiPayload,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (!externalApiResponse.data || !externalApiResponse.data.data) {
      return res.status(500).send({
        msg: "Failed to fetch buyer details from the external API",
        success: false,
      });
    }
    console.log("External API Response:", externalApiResponse.data.data);
    // Map buyer details by user_id for efficient lookup
    const buyerDetailsMap = new Map(
      externalApiResponse.data.data.map((buyer) => [buyer.user_id, buyer])
    );
    // Add respective buyer details and file details to each application
    const fileDetailsQuery = `
      SELECT tud.*, ta.user_id, ta.status AS application_status
      FROM tender_user_doc tud
      LEFT JOIN tender_application ta ON tud.tender_id = ta.tender_id AND tud.user_id = ta.user_id
      WHERE tud.tender_id IN (${placeholders});
    `;
    const [fileDetailsResult] = await db.execute(fileDetailsQuery, tenderIds);
    const fileDetailsMap = new Map();
    fileDetailsResult.forEach((file) => {
      const key = `${file.tender_id}-${file.user_id}`;
      if (!fileDetailsMap.has(key)) {
        fileDetailsMap.set(key, []);
      }
      // Add unique file details
      const existingFiles = fileDetailsMap.get(key);
      const isDuplicate = existingFiles.some(
        (f) => f.tender_user_doc_id === file.tender_user_doc_id
      );
      if (!isDuplicate) {
        fileDetailsMap.get(key).push(file);
      }
    });
    // Add buyer details and file details to each application
    applicationsResult.forEach((application) => {
      const key = `${application.tender_id}-${application.user_id}`;
      application.buyer_details =
        buyerDetailsMap.get(application.user_id) || null;
      application.file_details = fileDetailsMap.get(key) || [];
    });
    applicationsResult.sort((a, b) => {
      const dateA = new Date(a.submitted_at || 0); // Default to 0 if `submitted_at` is missing
      const dateB = new Date(b.submitted_at || 0);
      return dateB - dateA; // Sort in descending order (latest submission first)
    });
    // Return the result
    res.status(200).send({
      msg: "Submitted tender applications retrieved successfully",
      success: true,
      data: applicationsResult,
    });
  } catch (error) {
    console.error(
      "Error Details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send({
      msg: "Error retrieving submitted tender applications",
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
};
module.exports = {
  getSubmittedTenderApplications,
};