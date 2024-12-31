import express from 'express';
import verifyUser from '../../middlewares/verifyUser.js';
import getAllVerifiedBuyersController from "../../controllers/misc/getAllVerifiedBuyersController.js";
import getAllPendingBuyersController from "../../controllers/admin/rejectedAndPendingUsers/getAllPendingBuyersController.js";
import getAllRejectedBuyersController from '../../controllers/admin/rejectedAndPendingUsers/getAllRejectedBuyersController.js';
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/get-all-verified-buyers", verifyUser, getAllVerifiedBuyersController);
router.get("/get-all-pending-buyers", isAdmin, getAllPendingBuyersController);
router.get("/get-all-rejected-buyers", isAdmin, getAllRejectedBuyersController);

export default router;
