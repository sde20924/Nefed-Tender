const express = require("express");
const router = express.Router();
const verifyUser = require("../../src/middleware/verifyUser");
const  getUserInfoController  = require("../../src/controllers/users/userInfoController");
const editUserInfoController = require("../../src/controllers/users/editUserInfoController");
const isAdmin = require("../../src/middleware/isAdmin");
const getAllManagers = require("../../src/controllers/misc/getAllManager");
const getManagerDetails = require("../../src/controllers/misc/getManagerDetails");
const listOfRequiredDocs = require("../../src/controllers/admin/listOfRequiredDocs");
const uploadDocController = require("../../src/controllers/users/uploadDocController");
const validateAndUploadMiddleware = require("../../src/middleware/validateAndUploadMiddleware");
const addExistingManagerAsManager = require("../../src/controllers/manager/addExistingManagerAsManager");


router.get("/get-user-info",verifyUser || isAdmin ,getUserInfoController);
router.post("/edit-user-info",verifyUser || isAdmin,editUserInfoController);

router.post("/upload-user-doc-new", verifyUser || isAdmin, validateAndUploadMiddleware, uploadDocController)


router.get("/get-all-managers", verifyUser ,getAllManagers);
router.get("/get-manager/:manager_id", verifyUser , getManagerDetails);
router.post("/add-as-manager", verifyUser , addExistingManagerAsManager);
router.get("/get-list-of-required-docs", verifyUser || isAdmin, listOfRequiredDocs )


module.exports = router;