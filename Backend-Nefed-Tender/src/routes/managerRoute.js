// src/routes/managerRouter.js

import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import getAllClientForManager from "../controllers/manager/getAllClientForManager.js";
import switchUser from "../controllers/manager/switch.js";

const router = express.Router();

// Route: Get All Clients for Manager
router.get("/manager/get-all-client", verifyUser, getAllClientForManager);

// Route: Switch User
router.get("/manager/switch-user/:login_as/:user_id", verifyUser, switchUser);

export default router;
