const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const questionController = require("../controllers/questionController");

// Answer management
router.post(
  "/:questionId/answers",
  verifyToken,
  checkRole,
  questionController.addAnswers
);
router.put(
  "/:questionId/answers/:answerId",
  verifyToken,
  checkRole,
  questionController.updateAnswers
);

module.exports = router;
