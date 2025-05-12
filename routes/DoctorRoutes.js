const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

router.get("/list", doctorController.getPatients);

module.exports = router;
