const express = require("express");
const router = express.Router();
const isAdmin = require("../../middleware/isAdmin");
const listOfNotVerifiedUsers = require("../../controllers/admin/listOfNotVerifiedUsers");
const updateRatingAndStatus = require("../../controllers/admin/updateRatingAndStatus");
const rejectApplication = require("../../controllers/admin/updateRatingAndStatus/RejectApplication");
const switchUser = require("../../controllers/admin/switchUser");
const blockOrDeleteUser = require("../../controllers/admin/blockOrDeleteUser");
const editUserInfo = require("../../controllers/admin/editUserInfo");
const getUserInfo = require("../../controllers/admin/getUserInfo");
const createTag = require("../../controllers/admin/createTag");
const updateTagForUser = require("../../controllers/admin/updateTagForUser");
const getAllBuyerTags = require("../../controllers/admin/getAllBuyerTags");
const getAllSellerTags = require("../../controllers/admin/getAllSellerTags");
const createRequiredDocument = require("../../controllers/admin/createRequiredDocument.js");
const getSellerByTagId = require("../../controllers/admin/getSellersByTagId/index.js");
const getBuyerByTagId = require("../../controllers/admin/getBuyersByTagId/index.js");
const listOfRequiredDocs = require("../../controllers/admin/listOfRequiredDocs/index.js");
const removeRequiredDocForTagId = require("../../controllers/admin/removeRequiredDocForTagId/index.js");
const removeTagById = require("../../controllers/admin/removeTagById/index.js");

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
