const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");

const getManagerList = asyncErrorHandler(async(req,res)=>{
   const query = `select user_id , first_name , last_name , email , phone_number , created_on from manager `;

   const {rows}=  await db.query(query);

   res.status(200).json({sellerData : rows , success:true});
});

module.exports = {getManagerList};
