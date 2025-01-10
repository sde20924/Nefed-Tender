import express from "express";
// import tenderRoute from "./tender.route.js";
// import userRoute from "./usersRoute.js";
// import buyerRoute from "./buyerRoute.js";
// import sellerRoute from "./sellerRoute.js";
// import adminRoute from "./adminRoute.js";
// import managerRoute from "./managerRoute.js";
import commonRoute from "./commonRoute.js";
import tenderRoutes from "./tenderRoute.js";

const router = express.Router();

// Define routes and their paths
const defaultRoutes = [
  {
    path: "/tender",
    route: tenderRoutes,
  },
  {
    path: "/common",
    route: commonRoute,
  },
  // {
  //   path: "/buyer",
  //   route: buyerRoute,
  // },
];

// Loop through each route and apply to the router
defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

// Register other routes with explicit base paths for clarity
// router.use("/users", userRoute);
// router.use("/buyers", buyerRoute);
// router.use("/sellers", sellerRoute);
// router.use("/admins", adminRoute);
// router.use("/managers", managerRoute);
// router.use("/tenders", tenderRoutes); // Ensure this is intentional and not duplicate

export default router;
