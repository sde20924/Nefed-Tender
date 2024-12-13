const express = require("express");
const router = express.Router();
const verifyUser = require('../../middleware/verifyUser')
const isAdmin = require("../../middleware/isAdmin");
const getAllClientForManager = require("../../controllers/manager/getAllClientForManager");
const switchUser = require("../../controllers/manager/switch");


router.get("/manager/get-all-client",verifyUser, getAllClientForManager);
router.get("/manager/switch-user/:login_as/:user_id", verifyUser, switchUser);

module.exports = router