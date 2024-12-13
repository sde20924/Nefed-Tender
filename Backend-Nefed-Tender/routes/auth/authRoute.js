const express = require("express");
const router = express.Router();

const { resendOtpValidationRules, otpValidationRules, resendOtp, verifyOtp } = require("../../controllers/auth/otpController");
const {  forgotPassValidationRules, forgotPassword } = require("../../controllers/auth/forgotPasswordController");
const {  setNewPassValidationRules, setNewPassword } = require("../../controllers/auth/setNewPasswordController");
const verifyUser = require("../../middleware/verifyUser");
const { buyerValidationRules, registerBuyerController } = require("../../controllers/auth/buyer/registerController");
const { sellerLoginValidationRules, sellerLoginController } = require("../../controllers/auth/seller/loginController");
const { registerSellerController, sellerValidationRules } = require("../../controllers/auth/seller/registerController");
const { managerLoginValidationRules, loginManagerController } = require("../../controllers/auth/manager/loginController");
const { registerManagerController, managerValidationRules } = require("../../controllers/auth/manager/registerController");
const { adminLoginValidationRules, adminLoginController } = require("../../controllers/auth/admin/loginController");
const { buyerLoginValidationRules, buyerLoginController } = require("../../controllers/auth/buyer/loginController");
const verifyUserController = require("../../controllers/auth/verifyUserController");
const verifyIsAdminController = require("../../controllers/auth/verifyIsAdminController");



router.post("/admin/login", adminLoginValidationRules,adminLoginController);

router.post("/manager/register", managerValidationRules,registerManagerController);
router.post("/manager/login", managerLoginValidationRules,loginManagerController);

router.post("/buyer/register", buyerValidationRules,registerBuyerController);
router.post("/buyer/login", buyerLoginValidationRules,buyerLoginController);

router.post("/seller/register", sellerValidationRules,registerSellerController);
router.post("/seller/login", sellerLoginValidationRules,sellerLoginController);

router.post("/otp/resend", resendOtpValidationRules, resendOtp);
router.post("/otp/verify", otpValidationRules,verifyOtp);

router.post("/forgot-password", forgotPassValidationRules,forgotPassword);
router.post("/set-new-password", setNewPassValidationRules,setNewPassword);

router.get("/xqwysr-taqw", verifyUserController);
router.get("/xqwysr-aabyv", verifyIsAdminController);

module.exports = router;




