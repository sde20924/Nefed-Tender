import express from "express";
import isAdmin from "../middlewares/isAdmin.js";
import listOfNotVerifiedUsers from "../controllers/admin/listOfNotVerifiedUsers/index.js";
import updateRatingAndStatus from "../controllers/admin/updateRatingAndStatus/index.js";
import rejectApplication from "../controllers/admin/updateRatingAndStatus/RejectApplication.js";
import switchUser from "../controllers/admin/switchUser/index.js";
import blockOrDeleteUser from "../controllers/admin/blockOrDeleteUser/index.js";
import editUserInfo from "../controllers/admin/editUserInfo/index.js";
import getUserInfo from "../controllers/admin/getUserInfo/index.js";
import createTag from "../controllers/admin/createTag/index.js";
import updateTagForUser from "../controllers/admin/updateTagForUser/index.js";
import getAllBuyerTags from "../controllers/admin/getAllBuyerTags/index.js";
import getAllSellerTags from "../controllers/admin/getAllSellerTags/index.js";
import createRequiredDocument from "../controllers/admin/createRequiredDocument/index.js";
import getSellerByTagId from "../controllers/admin/getSellersByTagId/index.js";
import getBuyerByTagId from "../controllers/admin/getBuyersByTagId/index.js";
import listOfRequiredDocs from "../controllers/admin/listOfRequiredDocs/index.js";
import removeRequiredDocForTagId from "../controllers/admin/removeRequiredDocForTagId/index.js";
import removeTagById from "../controllers/admin/removeTagById/index.js";
import { getAllTendersController } from "../controllers/admin/tenders/get.controller.js";

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

//Tenders
router.get("/tenders", getAllTendersController);

export default router;
