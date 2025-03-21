const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  saveReadingController,
  getReadingsController,
} = require("../controllers/glucoseController");
const router = express.Router();

router.post("/save-reading", verifyToken, saveReadingController);
router.get("/get-readings", getReadingsController);

module.exports = router;
