// src/routes/tenderRouter.js

import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import isAdmin from "../middlewares/isAdmin.js";

import { createNewTenderController,submitFileUrl } from "../controllers/tender/seller/tenders/post.controller.js";
import { cloneTenderController } from "../controllers/tender/seller/reports/post.controller.js";
import {getSellerBuyerList,getAccessBidWithSuggestedPrice} from "../controllers/tender/seller/buyer/get.controller.js"
import {createNewBuyerController} from "../controllers/tender/seller/buyer/post.controller.js"
import { updateTenderApplicationBySeller } from "../controllers/tender/seller/tenders/update.controller.js";
// import { createAudienceController } from "../controllers/tender/createAudience.js";

import { getSellerTendersController,getSubmittedTenderApplications } from "../controllers/tender/seller/tenders/get.controller.js";
// import { getTenderDetailsController } from "../controllers/tender/getTenderDetailById.js";
import { getTenderApplicationsByUser,getBidDetails,getTenderBids } from "../controllers/tender/buyer/tenders/get.controller.js";
import { saveBuyerHeaderRowData } from "../controllers/tender/buyer/tenders/post.controller.js";
// import { getSubmittedTenderApplications } from "../controllers/tender/getSellerApplication.js";
// import { getTenderFilesAndStatus } from "../controllers/tender/getBuyerSavedData.js";
// import { updateTenderApplicationBySeller } from "../controllers/tender/applicationUpdatedStatusByseller.js";
// import { submitBid } from "../controllers/tender/tenderBidRoomController.js";
// import { getTenderBids } from "../controllers/tender/getTenderBidAmount.js";
import { getActiveTenders } from "../controllers/tender/buyer/tenders/get.controller.js";
// import { updateTenderDetails } from "../controllers/tender/editTenderForm.js";
// import { cloneTenderController } from "../controllers/tender/cloneTenderController.js";
import { deleteTenderController } from "../controllers/tender/seller/tenders/delete.controller.js";
import { getAllAuctionBids } from "../controllers/tender/seller/reports/get.controller.js";
// import { announceWinner } from "../controllers/tender/updateFirstAuctionWinner.js";
// import { getTenderBidsByTenderId } from "../controllers/tender/getAllBidAmount.js";
// import { getTenderMiniSummary } from "../controllers/tender/getTenderMiniSummary.js";
// import { getSellerList } from "../controllers/tender/getsellerList.js";
// import { getBuyerList } from "../controllers/tender/getBuyerList.js";
// import { getManagerList } from "../controllers/tender/getManagerList.js";
// import { getHomepageContent } from "../controllers/tender/getHomePageContent.js";
// import { updateHomepageContent } from "../controllers/tender/updateHomePageContent.js";
// import { getTenderAuctionItemsController } from "../controllers/tender/getTenderAuctionItemsController.js";
// import { getAllDemoExcelSheetsController } from "../controllers/tender/getAllDemoExcelSheetsController.js";

const router = express.Router();

// Routes for getting tenders

router.get("/seller-tenders", verifyUser, getSellerTendersController);
// router.get("/tender/:id", getTenderDetailsController);
router.get("/tender-applications", verifyUser, getTenderApplicationsByUser);
router.get(
  "/submitted-tender-applications",
  verifyUser,
  getSubmittedTenderApplications
);

router.get("/bid/:tender_id", verifyUser, getTenderBids);
router.get("/tenders/active", verifyUser, getActiveTenders);
router.get("/tender-Auction-bids/:tender_id", verifyUser, getAllAuctionBids);
// router.get(
//   "/tender-All-bidAmount/:tender_id",
//   verifyUser,
//   getTenderBidsByTenderId
// );
// router.get("/tender-mini-summary/:tender_id", verifyUser, getTenderMiniSummary);
// router.get("/get-seller-list", verifyUser, getSellerList);
// router.get("/get-buyer-list", verifyUser, getBuyerList);
// router.get("/get-manager-list", verifyUser, getManagerList);

// // Routes for homepage content
// router.get("/get-home-page-content", getHomepageContent);
// router.get("/demo-excel-sheets", getAllDemoExcelSheetsController);
// router.get(
//   "/get-tender-auction-items/:tender_id",
//   verifyUser,
//   getTenderAuctionItemsController
// );

// Routes for creating and managing tenders
router.post("/create_new_tender", verifyUser, createNewTenderController);
// router.post("/create_audience", verifyUser, createAudienceController);
router.post("/submit-file-url", verifyUser, submitFileUrl);
router.post(
  "/update-tender-application",
  verifyUser,
  updateTenderApplicationBySeller
);
// router.post("/bid/submit", verifyUser, submitBid);
// router.post("/update-tender/:id", verifyUser, updateTenderDetails);
router.post("/clone-tender/:id", verifyUser, cloneTenderController);
// router.post("/tender/announce-winner/:tender_id", verifyUser, announceWinner);

// // Route for deleting tender
router.delete("/delete-tender/:id", verifyUser, deleteTenderController);

//buyers
router.post("/buyer_list", verifyUser, getSellerBuyerList);
router.post("/new_buyer", verifyUser, createNewBuyerController);
router.get("/get-bid-details", verifyUser, getBidDetails);
router.post(
  "/buyer-bid",
  verifyUser,
  saveBuyerHeaderRowData
);
router.get("/get-access-bid/:id", verifyUser, getAccessBidWithSuggestedPrice);


export default router;
