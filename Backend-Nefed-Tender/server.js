const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoute = require("./routes/auth/authRoute");
const userRoute = require("./routes/users/usersRoute");
const tenderRoute = require('./routes/tender/tenderRoute')
const buyerRoute = require("./routes/buyers/buyerRoute")
const sellerRoute = require('./routes/sellers/sellerRoute')
const connection = require("./config/config");
const adminRoute = require("./routes/admin/adminRoute");
const managerRoute = require("./routes/manager/managerRoute");
const CustomError = require('./utils/customError')
const globalErrorHandler = require("./controllers/error/errorController")
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
  }));
app.use(cors());
app.use(helmet());

//Routes
app.use(authRoute);
app.use(userRoute);
app.use(tenderRoute)
app.use(adminRoute);
app.use(buyerRoute);
app.use(sellerRoute)
app.use(managerRoute)


app.all('*', (req, res, next)=>{
const err = new CustomError(`Can't find this ${req.originalUrl} on server`);
next(err)
})
app.use(globalErrorHandler)

app.listen(8002, () => {
  console.log("server started on port 8002");
});

module.exports = app;