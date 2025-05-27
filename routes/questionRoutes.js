const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const questionController = require("../controllers/questionController");

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

module.exports = router;
