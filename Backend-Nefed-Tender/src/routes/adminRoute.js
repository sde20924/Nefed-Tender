const express = require("express");
const isAdmin = require("../middlewares/isAdmin");
const listOfNotVerifiedUsers = require("../controllers/admin/listOfNotVerifiedUsers/index");
const updateRatingAndStatus = require("../controllers/admin/updateRatingAndStatus/index");
const rejectApplication = require("../controllers/admin/updateRatingAndStatus/RejectApplication");
const switchUser = require("../controllers/admin/switchUser/index");
const blockOrDeleteUser = require("../controllers/admin/blockOrDeleteUser/index");
const editUserInfo = require("../controllers/admin/editUserInfo/index");
const getUserInfo = require("../controllers/admin/getUserInfo/index");
const createTag = require("../controllers/admin/createTag/index");
const updateTagForUser = require("../controllers/admin/updateTagForUser/index");
const getAllBuyerTags = require("../controllers/admin/getAllBuyerTags/index");
const getAllSellerTags = require("../controllers/admin/getAllSellerTags/index");
const createRequiredDocument = require("../controllers/admin/createRequiredDocument/index");
const getSellerByTagId = require("../controllers/admin/getSellersByTagId/index");
const getBuyerByTagId = require("../controllers/admin/getBuyersByTagId/index");
const listOfRequiredDocs = require("../controllers/admin/listOfRequiredDocs/index");
const removeRequiredDocForTagId = require("../controllers/admin/removeRequiredDocForTagId/index");
const removeTagById = require("../controllers/admin/removeTagById/index");

const router = express.Router();

router.post(
  "/admin/update-application-status-and-rating",
  isAdmin,
  updateRatingAndStatus
);
router.post("/admin/reject-application", isAdmin, rejectApplication);
router.get("/admin/unverified-users-list", isAdmin, listOfNotVerifiedUsers);

router.get("/admin/switch-user/:login_as/:user_id", isAdmin, switchUser);
router.post("/admin/block-or-delete-user", isAdmin, blockOrDeleteUser);
router.post("/admin/edit-user-info/:login_as/:user_id", isAdmin, editUserInfo);
router.get("/admin/get-user-info/:login_as/:user_id", isAdmin, getUserInfo);

router.post("/admin/create-tag", isAdmin, createTag);
router.post("/admin/update-tag-for-user", isAdmin, updateTagForUser);

router.get("/admin/get-all-buyer-tags", isAdmin, getAllBuyerTags);
router.get("/admin/get-all-seller-tags", isAdmin, getAllSellerTags);
router.post(
  "/admin/create-required-docs-for-tags",
  isAdmin,
  createRequiredDocument
);

router.get("/admin/get-buyers-by-tag-id/:tag_id", isAdmin, getBuyerByTagId);
router.get("/admin/get-sellers-by-tag-id/:tag_id", isAdmin, getSellerByTagId);

router.get(
  "/get-list-of-required-docs-with-tag-id/:tag_id",
  isAdmin,
  listOfRequiredDocs
);
router.get(
  "/admin/get-list-of-required-docs-with-tag-id/:tag_id",
  isAdmin,
  listOfRequiredDocs
);

router.delete(
  "/admin/remove-item-of-required-docs-with-tag-id/:tag_id/:doc_id",
  isAdmin,
  removeRequiredDocForTagId
);
router.delete("/admin/remove-tag-id/:tag_id", isAdmin, removeTagById);

module.exports = router;
