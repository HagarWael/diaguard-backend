const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const doctorController = require("../controllers/doctorController");

// Patient management
router.get(
  "/patients",
  verifyToken,
  checkRole(["doctor"]),
  doctorController.getPatients
);

// Patient monitoring
router.get(
  "/patients/:patientId",
  verifyToken,
  checkRole(["doctor"]),
  doctorController.getPatient
);

// Communication
router.post(
  "/patients/:patientId/messages",
  verifyToken,
  checkRole(["doctor"]),
  doctorController.sendMessage
);
router.get(
  "/patients/:patientId/messages",
  verifyToken,
  checkRole(["doctor"]),
  doctorController.getMessages
);

module.exports = router;
