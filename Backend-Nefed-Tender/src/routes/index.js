const express = require("express");
const tenderRoute = require("./tender.route");
const userRoute = require("./usersRoute");
const buyerRoute = require("./buyerRoute");
const sellerRoute = require("./sellerRoute");
const adminRoute = require("./adminRoute");
const managerRoute = require("./managerRoute");
const tenderRoutes = require("./tenderRoute");

const router = express.Router();

// Define routes and their paths
const defaultRoutes = [
  {
    path: "/tender",
    route: tenderRoute,
  },
];

// Loop through each route and apply to the router
defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Register other routes
router.use(userRoute);
router.use(buyerRoute);
router.use(sellerRoute);
router.use(adminRoute);
router.use(managerRoute);
router.use(tenderRoutes);

module.exports = router;
