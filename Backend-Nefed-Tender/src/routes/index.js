import express from 'express';
import tenderRoute from './tender.route.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/tender',
    route: tenderRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
export default router;
