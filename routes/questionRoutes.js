const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const questionController = require("../controllers/questionController");
const userController = require("../controllers/userController");
const User = require("../model/User1");

// Answer management
router.post(
  "/:questionId/answers",
  verifyToken,
  checkRole(["patient"]),
  questionController.addAnswers
);
router.put(
  "/:questionId/answers/:answerId",
  verifyToken,
  checkRole(["patient"]),
  questionController.updateAnswers
);

router.post("/save-answers", verifyToken, questionController.saveAnswers);
router.get("/get-answers", verifyToken, questionController.getAnswers);

module.exports = router;
