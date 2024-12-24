const express = require("express");
const router = express.Router();
const verifyUser = require("../../src/middleware/verifyUser")
const createNewTenderController = require("../../src/controllers/tender/createNewTender");
const createAudienceController = require("../../src/controllers/tender/createAudience");
const { submitFileUrl } = require('../../src/controllers/tender/buyerDocumentUpload');

const { getAllTendersController } = require('../../src/controllers/tender/viewNewTender');
const { getSellerTendersController } = require('../../src/controllers/tender/viewSellerTender'); 
const { getTenderDetailsController } = require('../../src/controllers/tender/getTenderDetailById');  
const {getTenderApplicationsByUser}  = require('../../src/controllers/tender/getBuyerApplication');
const {getSubmittedTenderApplications} = require('../../src/controllers/tender/getSellerApplication');
const { getTenderFilesAndStatus  } = require('../../src/controllers/tender/getBuyerSavedData');
const { updateTenderApplicationBySeller } = require('../../src/controllers/tender/applicationUpdatedStatusByseller');
const { submitBid} = require('../../src/controllers/tender/tenderBidRoomController');
const {getTenderBids} = require('../../src/controllers/tender/getTenderBidAmount');
const {getActiveTenders} = require('../../src/controllers/tender/getActiveTenderOnly');
const updateTenderDetails = require('../../src/controllers/tender/editTenderForm'); 
const { cloneTenderController } = require('../../src/controllers/tender/cloneTenderController');
const {deleteTenderController} = require('../../src/controllers/tender/deleteTenderController');
const { getAllAuctionBids } = require('../../src/controllers/tender/getAllAuctionBids');
const { announceWinner } = require('../../src/controllers/tender/updateFirstAuctionWinner');
const {getTenderBidsByTenderId} = require('../../src/controllers/tender/getAllBidAmount');
const { getTenderMiniSummary } = require('../../src/controllers/tender/getTenderMiniSummary');
const { getSellerList} = require('../../src/controllers/tender/getsellerList');
const { getBuyerList} = require('../../src/controllers/tender/getBuyerList');
const { getManagerList} = require('../../src/controllers/tender/getManagerList');

const {getHomepageContent} = require("../../src/controllers/tender/getHomePageContent");
const {updateHomepageContent} = require("../../src/controllers/tender/updateHomePageContent");

const {getTenderAuctionItemsController} = require("../../src/controllers/tender/getTenderAuctionItemsController")

// Route to get all tenders 
router.get('/tenders', getAllTendersController);
router.get('/seller-tenders', verifyUser, getSellerTendersController);
router.get('/tender/:id', getTenderDetailsController);
router.get('/tender-applications',verifyUser,getTenderApplicationsByUser);
router.get('/submitted-tender-applications', verifyUser, getSubmittedTenderApplications);
router.get('/tender/:id/files-status', getTenderFilesAndStatus );
router.get('/tender/bid/:tender_id',verifyUser,getTenderBids);
router.get('/tenders/active',verifyUser,getActiveTenders);
router.get('/tender-Auction-bids/:tender_id',verifyUser, getAllAuctionBids);  
router.get('/tender-All-bidAmount/:tender_id',verifyUser,getTenderBidsByTenderId) ;   
router.get('/tender-mini-summary/:tender_id',verifyUser, getTenderMiniSummary); 
router.get('/get-seller-list',verifyUser,getSellerList);
router.get('/get-buyer-list',verifyUser,getBuyerList);
router.get('/get-manager-list',verifyUser,getManagerList);

router.get('/get-home-page-content', getHomepageContent);

router.get('/get-tender-auction-items/:tender_id',verifyUser,getTenderAuctionItemsController);

router.post("/create_new_tender", verifyUser, createNewTenderController);
router.post("/create_audience", verifyUser, createAudienceController);
router.post('/submit-file-url',verifyUser, submitFileUrl);
router.post('/update-tender-application',verifyUser, updateTenderApplicationBySeller);
router.post('/bid/submit',verifyUser,submitBid);
router.post('/update-tender/:id', verifyUser, updateTenderDetails);
router.post('/clone-tender/:id', verifyUser, cloneTenderController);
router.post('/tender/announce-winner/:tender_id',verifyUser, announceWinner);

router.post('/update-home-page-content',verifyUser,updateHomepageContent);

router.delete('/delete-tender/:id', verifyUser, deleteTenderController);


module.exports = router;