// src/routes/sellerRouter.js

import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import getAllVerifiedSellersController from "../controllers/misc/getAllVerifiedSellersController.js";
import getAllPendingSellersController from "../controllers/admin/rejectedAndPendingUsers/getAllPendingSellersController.js";
import getAllRejectedSellersController from "../controllers/admin/rejectedAndPendingUsers/getAllRejectedSellersController.js";

const router = express.Router();

// Route: Get All Verified Sellers
router.get(
  "/get-all-verified-sellers",
  verifyUser,
  getAllVerifiedSellersController
);

// Route: Get All Pending Sellers
router.get("/get-all-pending-sellers", isAdmin, getAllPendingSellersController);

// Route: Get All Rejected Sellers
router.get(
  "/get-all-rejected-sellers",
  isAdmin,
  getAllRejectedSellersController
);

export default router;
