// src/routes/userRouter.js

import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import isAdmin from "../middlewares/isAdmin.js";

import getUserInfoController from "../controllers/users/userInfoController.js";
import editUserInfoController from "../controllers/users/editUserInfoController.js";
import getAllManagers from "../controllers/misc/getAllManager.js";
import getManagerDetails from "../controllers/misc/getManagerDetails.js";
import listOfRequiredDocs from "../controllers/admin/listOfRequiredDocs/index.js";
import uploadDocController from "../controllers/users/uploadDocController.js";
import validateAndUploadMiddleware from "../middlewares/validateAndUploadMiddleware.js";
import addExistingManagerAsManager from "../controllers/manager/addExistingManagerAsManager.js";

const router = express.Router();

// Custom Middleware to allow access if either verifyUser or isAdmin passes
function verifyOrAdmin(req, res, next) {
  verifyUser(req, res, () => {
    // If verifyUser passes, proceed
    next();
  }) || isAdmin(req, res, next);
}

// Alternatively, use an array of middlewares if both need to pass
// router.get("/get-user-info", [verifyUser, isAdmin], getUserInfoController);

router.get("/get-user-info", verifyOrAdmin, getUserInfoController);
router.post("/edit-user-info", verifyOrAdmin, editUserInfoController);

router.post(
  "/upload-user-doc-new",
  verifyOrAdmin,
  validateAndUploadMiddleware,
  uploadDocController
);

router.get("/get-all-managers", verifyUser, getAllManagers);
router.get("/get-manager/:manager_id", verifyUser, getManagerDetails);
router.post("/add-as-manager", verifyUser, addExistingManagerAsManager);
router.get("/get-list-of-required-docs", verifyOrAdmin, listOfRequiredDocs);

export default router;
