import express from 'express';
import verifyUser from '../middlewares/verifyUser.js';
import getAllVerifiedSellersController from "../controllers/misc/getAllVerifiedSellersController.js";
import getAllPendingSellersController from "../controllers/admin/rejectedAndPendingUsers/getAllPendingSellersController.js";
import getAllRejectedSellersController from "../controllers/admin/rejectedAndPendingUsers/getAllRejectedSellersController.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/get-all-verified-sellers", verifyUser, getAllVerifiedSellersController);
router.get("/get-all-pending-sellers", isAdmin, getAllPendingSellersController);
router.get("/get-all-rejected-sellers", isAdmin, getAllRejectedSellersController);

export default router;
