const express = require("express");
const router = express.Router();
const verifyUser = require('../../src/middleware/verifyUser')
const getAllVerifiedSellersController = require("../../src/controllers/misc/getAllVerifiedSellersController");
const getAllPendingSellersController = require("../../src/controllers/admin/rejectedAndPendingUsers/getAllPendingSellersController");
const getAllRejectedSellersController = require("../../src/controllers/admin/rejectedAndPendingUsers/getAllRejectedSellersController");
const isAdmin = require("../../src/middleware/isAdmin");

router.get("/get-all-verified-sellers", verifyUser, getAllVerifiedSellersController);
router.get("/get-all-pending-sellers", isAdmin, getAllPendingSellersController);
router.get("/get-all-rejected-sellers", isAdmin, getAllRejectedSellersController);

module.exports = router