const express = require("express");
const router = express.Router();
const isAdmin = require("../../src/middleware/isAdmin.js");
const listOfNotVerifiedUsers = require("../../src/controllers/admin/listOfNotVerifiedUsers.js");
const updateRatingAndStatus = require("../../src/controllers/admin/updateRatingAndStatus.js");
const rejectApplication = require("../../src/controllers/admin/updateRatingAndStatus/RejectApplication.js");
const switchUser = require("../../src/controllers/admin/switchUser.js");
const blockOrDeleteUser = require("../../src/controllers/admin/blockOrDeleteUser.js");
const editUserInfo = require("../../src/controllers/admin/editUserInfo.js");
const getUserInfo = require("../../src/controllers/admin/getUserInfo.js");
const createTag = require("../../src/controllers/admin/createTag.js");
const updateTagForUser = require("../../src/controllers/admin/updateTagForUser.js");
const getAllBuyerTags = require("../../src/controllers/admin/getAllBuyerTags.js");
const getAllSellerTags = require("../../src/controllers/admin/getAllSellerTags.js");
const createRequiredDocument = require("../../src/controllers/admin/createRequiredDocument.js");
const getSellerByTagId = require("../../src/controllers/admin/getSellersByTagId/index.js");
const getBuyerByTagId = require("../../src/controllers/admin/getBuyersByTagId/index.js");
const listOfRequiredDocs = require("../../src/controllers/admin/listOfRequiredDocs/index.js");
const removeRequiredDocForTagId = require("../../src/controllers/admin/removeRequiredDocForTagId/index.js");
const removeTagById = require("../../src/controllers/admin/removeTagById/index.js");

router.post("/admin/update-application-status-and-rating", isAdmin ,updateRatingAndStatus);
router.post("/admin/reject-application", isAdmin ,rejectApplication);
router.get("/admin/unverified-users-list", isAdmin ,listOfNotVerifiedUsers);

router.get("/admin/switch-user/:login_as/:user_id", isAdmin ,switchUser);
router.post("/admin/block-or-delete-user", isAdmin ,blockOrDeleteUser);
router.post("/admin/edit-user-info/:login_as/:user_id", isAdmin, editUserInfo);
router.get("/admin/get-user-info/:login_as/:user_id", isAdmin, getUserInfo);

router.post("/admin/create-tag", isAdmin, createTag);
router.post("/admin/update-tag-for-user", isAdmin, updateTagForUser);

router.get("/admin/get-all-buyer-tags", isAdmin, getAllBuyerTags);
router.get("/admin/get-all-seller-tags", isAdmin, getAllSellerTags);
router.post("/admin/create-required-docs-for-tags", isAdmin, createRequiredDocument);

router.get("/admin/get-buyers-by-tag-id/:tag_id", isAdmin, getBuyerByTagId);
router.get("/admin/get-sellers-by-tag-id/:tag_id", isAdmin, getSellerByTagId);

router.get("/get-list-of-required-docs-with-tag-id/:tag_id", isAdmin, listOfRequiredDocs )
router.get("/admin/get-list-of-required-docs-with-tag-id/:tag_id", isAdmin, listOfRequiredDocs )

router.delete("/admin/remove-item-of-required-docs-with-tag-id/:tag_id/:doc_id", isAdmin, removeRequiredDocForTagId )
router.delete("/admin/remove-tag-id/:tag_id", isAdmin, removeTagById  )




module.exports = router;
