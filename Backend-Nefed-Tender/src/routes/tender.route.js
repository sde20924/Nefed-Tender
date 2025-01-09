const express = require("express");
const auth = require("../middlewares/auth");
const {
  ViewTender,
  CreateTender,
} = require("../controllers/tender.controller");

const router = express.Router();

router.post("/create-tender", auth("createTender"), CreateTender);
router.get("/view-tender", auth("viewTender"), ViewTender);

module.exports = router;
