const db = require("../../config/config");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");

const getSellerList = asyncErrorHandler(async(req,res)=>{
   const query = `select seller_id , first_name , last_name , email , phone_number , created_on from seller `;

   const {rows}=  await db.query(query);

   res.status(200).json({sellerData : rows , success:true});
});

module.exports = {getSellerList};
