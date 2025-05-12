// controllers/doctorController.js
const doctorService = require("../services/doctorService");
const Doctor = require("../model/Doctor");

const getPatients = async (req, res) => {
  const doctorCode = req.params.code;

  try {
    const patients = await doctorService.getPatientsByDoctorCode(code);
    res.status(200).json({ status: "successful", patients });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = { getPatients };
