// File: controllers/tender/viewNewTender.js
const db = require('../../config/config'); // Adjusted path to the database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Adjusted path to async error handler middleware

// Controller to get all tenders
const getAllTendersController = asyncErrorHandler(async (req, res) => {
  // try {
  //   const result = await db.query(`SELECT * FROM manage_tender`);  
  //   res.status(200).json(result.rows);
  // } catch (error) {
  //   console.error("Error fetching tenders:", error.message);
  //   res.status(500).send({ msg: "Error fetching tenders", error: error.message });
  // }
  const tenderQuery=`SELECT * FROM manage_tender`;
const {rows:tenders}=await db.query( tenderQuery);
const showTender=tenders;

return res.status(200).json({
  data: showTender,
  msg: "tender data fetched successfully",
  success:true
})


});

module.exports = {
  getAllTendersController,
};


