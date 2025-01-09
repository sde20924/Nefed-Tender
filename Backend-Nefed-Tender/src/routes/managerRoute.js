const express = require("express");
const verifyUser = require("../middlewares/verifyUser");
const isAdmin = require("../middlewares/isAdmin");
const getAllClientForManager = require("../controllers/manager/getAllClientForManager");
const switchUser = require("../controllers/manager/switch");

const router = express.Router();

router.get("/manager/get-all-client", verifyUser, getAllClientForManager);
router.get("/manager/switch-user/:login_as/:user_id", verifyUser, switchUser);

module.exports = router;
