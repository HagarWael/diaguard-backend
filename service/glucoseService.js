const Glugose = require("../model/Glugose");
const mongoose = require("mongoose");
const Patient = require("../model/Patient");

const saveReading = async (user, value, type) => {
  const patientId = user.userId;

  console.log("searching for patient with id:", patientId);

  // if (!mongoose.Types.ObjectId.isValid(patientId)) {
  //   throw new Error("invalid patient iddd");
  // }

  const patient = await Patient.findOne({ patientId });
  console.log("Patient found:", patient);
  if (!patient) {
    throw new Error("Patient not found");
  }
  ////console.log("Patient found:", patient);

  const newReading = new Glugose({ value, type, patient: patientId });
  await newReading.save();

  return { message: "Reading saved successfully", reading: newReading };
};

const getReadings = async (user) => {
  const patientId = user.userId;

  const readings = await Glugose.find({ patient: patientId }).sort({
    date: -1,
  });
  return { readings };
};

module.exports = { saveReading, getReadings };
