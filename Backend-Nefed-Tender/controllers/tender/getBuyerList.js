const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");

const getBuyerList = asyncErrorHandler(async(req,res)=>{
   const query = `select user_id , first_name , last_name , email , phone_number , created_on from buyer `;

   const {rows}=  await db.query(query);

   res.status(200).json({sellerData : rows , success:true});
});

module.exports = {getBuyerList};
