import express from "express";
import verifyUser from "../middlewares/verifyUser.js";

import {
  getTenderDetailsController,
  getAllDemoExcelSheetsController,
} from "../controllers/common/tenders/get.controller.js";

import { getTenderFilesAndStatus } from "../controllers/common/tenders/get.controller.js";

const router = express.Router();

router.get("/tender/:id", verifyUser, getTenderDetailsController);
router.get("/demo-excel-sheets", verifyUser, getAllDemoExcelSheetsController);
router.get("/tender/:id/files-status", getTenderFilesAndStatus);



export default router;
