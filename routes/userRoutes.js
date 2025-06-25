const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");
const checkRole = require("../middleware/checkRole");
const userController = require("../controllers/userController");

router.get("/profile", verifyToken, checkRole, getUserProfile);
router.put("/profile", verifyToken, checkRole, updateUserProfile);
router.put("/change-password", verifyToken, checkRole, changePassword);
router.delete("/account", verifyToken, checkRole, deleteAccount);
router.post("/save-answers", verifyToken, userController.saveAnswers);
router.get("/get-answers", verifyToken, userController.getAnswers);

module.exports = router;
