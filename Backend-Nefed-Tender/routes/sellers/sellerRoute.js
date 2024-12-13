const express = require("express");
const router = express.Router();
const verifyUser = require('../../middleware/verifyUser')
const getAllVerifiedSellersController = require("../../controllers/misc/getAllVerifiedSellersController");
const getAllPendingSellersController = require("../../controllers/admin/rejectedAndPendingUsers/getAllPendingSellersController");
const getAllRejectedSellersController = require("../../controllers/admin/rejectedAndPendingUsers/getAllRejectedSellersController");
const isAdmin = require("../../middleware/isAdmin");

router.get("/get-all-verified-sellers", verifyUser, getAllVerifiedSellersController);
router.get("/get-all-pending-sellers", isAdmin, getAllPendingSellersController);
router.get("/get-all-rejected-sellers", isAdmin, getAllRejectedSellersController);

module.exports = router