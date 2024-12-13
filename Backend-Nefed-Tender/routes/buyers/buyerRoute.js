const express = require("express");
const router = express.Router();
const verifyUser = require('../../middleware/verifyUser')
const getAllVerifiedBuyersController = require("../../controllers/misc/getAllVerifiedBuyersController");
const getAllPendingBuyersController = require("../../controllers/admin/rejectedAndPendingUsers/getAllPendingBuyersController");
const getAllRejectedBuyersController = require('../../controllers/admin/rejectedAndPendingUsers/getAllRejectedBuyersController');
const isAdmin = require("../../middleware/isAdmin");

router.get("/get-all-verified-buyers", verifyUser, getAllVerifiedBuyersController);
router.get("/get-all-pending-buyers", isAdmin, getAllPendingBuyersController);
router.get("/get-all-rejected-buyers", isAdmin, getAllRejectedBuyersController);

module.exports = router