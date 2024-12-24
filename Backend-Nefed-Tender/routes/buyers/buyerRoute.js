const express = require("express");
const router = express.Router();
const verifyUser = require('../../src/middleware/verifyUser')
const getAllVerifiedBuyersController = require("../../src/controllers/misc/getAllVerifiedBuyersController");
const getAllPendingBuyersController = require("../../src/controllers/admin/rejectedAndPendingUsers/getAllPendingBuyersController");
const getAllRejectedBuyersController = require('../../src/controllers/admin/rejectedAndPendingUsers/getAllRejectedBuyersController');
const isAdmin = require("../../src/middleware/isAdmin");

router.get("/get-all-verified-buyers", verifyUser, getAllVerifiedBuyersController);
router.get("/get-all-pending-buyers", isAdmin, getAllPendingBuyersController);
router.get("/get-all-rejected-buyers", isAdmin, getAllRejectedBuyersController);

module.exports = router