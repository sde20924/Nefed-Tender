const express = require("express");
const router = express.Router();
const verifyUser = require('../../src/middleware/verifyUser')
const isAdmin = require("../../src/middleware/isAdmin");
const getAllClientForManager = require("../../src/controllers/manager/getAllClientForManager");
const switchUser = require("../../src/controllers/manager/switch");


router.get("/manager/get-all-client",verifyUser, getAllClientForManager);
router.get("/manager/switch-user/:login_as/:user_id", verifyUser, switchUser);

module.exports = router