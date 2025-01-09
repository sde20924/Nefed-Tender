const express = require("express");
const verifyUser = require("../middlewares/verifyUser");
const isAdmin = require("../middlewares/isAdmin");
const getUserInfoController = require("../controllers/users/userInfoController");
const editUserInfoController = require("../controllers/users/editUserInfoController");
const getAllManagers = require("../controllers/misc/getAllManager");
const getManagerDetails = require("../controllers/misc/getManagerDetails");
const listOfRequiredDocs = require("../controllers/admin/listOfRequiredDocs/index");
const uploadDocController = require("../controllers/users/uploadDocController");
const validateAndUploadMiddleware = require("../middlewares/validateAndUploadMiddleware");
const addExistingManagerAsManager = require("../controllers/manager/addExistingManagerAsManager");

const router = express.Router();

router.get("/get-user-info", verifyUser || isAdmin, getUserInfoController);
router.post("/edit-user-info", verifyUser || isAdmin, editUserInfoController);

router.post(
  "/upload-user-doc-new",
  verifyUser || isAdmin,
  validateAndUploadMiddleware,
  uploadDocController
);

router.get("/get-all-managers", verifyUser, getAllManagers);
router.get("/get-manager/:manager_id", verifyUser, getManagerDetails);
router.post("/add-as-manager", verifyUser, addExistingManagerAsManager);
router.get(
  "/get-list-of-required-docs",
  verifyUser || isAdmin,
  listOfRequiredDocs
);

module.exports = router;
