import express from 'express';
import tenderRoute from './tender.route.js';
import userRoute from './usersRoute.js';
import buyerRoute from './buyerRoute.js';
import sellerRoute from './sellerRoute.js';
import adminRoute from './adminRoute.js';
import managerRoute from './managerRoute.js';
import tenderRoutes from './tenderRoute.js'

const router = express.Router();

// Define routes and their paths
const defaultRoutes = [
  {
    path: '/tender',
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
export default router;
