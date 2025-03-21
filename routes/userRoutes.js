const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getUserProfile } = require("../controllers/userController");
const checkRole = require("../middleware/checkRole");

router.get("/profile", verifyToken, checkRole, getUserProfile);

module.exports = router;
