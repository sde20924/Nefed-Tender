const express = require("express");
const router = express.Router();
const verifyUser = require("../../middleware/verifyUser");
const  getUserInfoController  = require("../../controllers/users/userInfoController");
const editUserInfoController = require("../../controllers/users/editUserInfoController");
const isAdmin = require("../../middleware/isAdmin");
const getAllManagers = require("../../controllers/misc/getAllManager");
const getManagerDetails = require("../../controllers/misc/getManagerDetails");
const listOfRequiredDocs = require("../../controllers/admin/listOfRequiredDocs");
const uploadDocController = require("../../controllers/users/uploadDocController");
const validateAndUploadMiddleware = require("../../middleware/validateAndUploadMiddleware");
const addExistingManagerAsManager = require("../../controllers/manager/addExistingManagerAsManager");


router.get("/get-user-info",verifyUser || isAdmin ,getUserInfoController);
router.post("/edit-user-info",verifyUser || isAdmin,editUserInfoController);

router.post("/upload-user-doc-new", verifyUser || isAdmin, validateAndUploadMiddleware, uploadDocController)


router.get("/get-all-managers", verifyUser ,getAllManagers);
router.get("/get-manager/:manager_id", verifyUser , getManagerDetails);
router.post("/add-as-manager", verifyUser , addExistingManagerAsManager);
router.get("/get-list-of-required-docs", verifyUser || isAdmin, listOfRequiredDocs )


module.exports = router;