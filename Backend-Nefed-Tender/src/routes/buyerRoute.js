import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import getAllVerifiedBuyersController from "../controllers/misc/getAllVerifiedBuyersController.js";
import getAllPendingBuyersController from "../controllers/admin/rejectedAndPendingUsers/getAllPendingBuyersController.js";
import getAllRejectedBuyersController from "../controllers/admin/rejectedAndPendingUsers/getAllRejectedBuyersController.js";
import isAdmin from "../middlewares/isAdmin.js";
import { getTenderApplicationsByUser } from "../controllers/tender/buyer/applications/get.controller.js";

const router = express.Router();

// Route: Get All Verified Buyers
router.get(
  "/get-all-verified-buyers",
  verifyUser,
  getAllVerifiedBuyersController
);

// Route: Get All Pending Buyers
router.get("/get-all-pending-buyers", isAdmin, getAllPendingBuyersController);

// Route: Get All Rejected Buyers
router.get("/get-all-rejected-buyers", isAdmin, getAllRejectedBuyersController);
router.get("/tender-applications", verifyUser, getTenderApplicationsByUser);

export default router;
