const express = require("express");
const router = express.Router();
const verifyUser = require("../../middleware/verifyUser");
const getAllVerifiedSellersController = require("../../controllers/misc/getAllVerifiedSellersController");
const getAllPendingSellersController = require("../../controllers/admin/rejectedAndPendingUsers/getAllPendingSellersController");
const getAllRejectedSellersController = require("../../controllers/admin/rejectedAndPendingUsers/getAllRejectedSellersController");
const createNewBuyerController = require("../../controllers/tender/createNewBuyer");
const { getSellerBuyerList } = require("../../controllers/tender/getBuyerList");
const isAdmin = require("../../middleware/isAdmin");

router.get(
  "/get-all-verified-sellers",
  verifyUser,
  getAllVerifiedSellersController
);
router.post("/new_buyer", verifyUser, createNewBuyerController);
router.post("/buyer_list", verifyUser, getSellerBuyerList);
router.get("/get-all-pending-sellers", isAdmin, getAllPendingSellersController);
router.get(
  "/get-all-rejected-sellers",
  isAdmin,
  getAllRejectedSellersController
);

module.exports = router;
