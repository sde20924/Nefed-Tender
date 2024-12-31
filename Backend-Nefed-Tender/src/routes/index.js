import express from 'express';
import tenderRoute from './tender.route.js';
import userRoute from './users/usersRoute.js';
import buyerRoute from './buyers/buyerRoute.js';
import sellerRoute from './sellers/sellerRoute.js';
import adminRoute from './admin/adminRoute.js';
import managerRoute from './manager/managerRoute.js';

const router = express.Router();

// Define routes and their paths
const defaultRoutes = [
  {
    path: '/tender',
    route: tenderRoute,
  }
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

export default router;
