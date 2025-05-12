const User = require("../models/User");
const Patient = require("../model/Patient");
const Doctor = require("../model/Doctor");

const getPatientsByDoctorCode = async (Code) => {
  try {
    // Find all patients with the given doctor code
    const patients = await User.find({ role: "patient", Code });
    return patients;
  } catch (error) {
    throw new Error("Error fetching patients");
  }
};

module.exports = { getPatientsByDoctorCode };
