const Glugose = require("../model/Glugose");
const Patient = require("../model/Patient");

const saveReading = async (user, value, type) => {
  const patientId = user._id;

  console.log("searching for patient with id:", patientId);

  // if (!mongoose.Types.ObjectId.isValid(patientId)) {
  //   throw new Error("invalid patient iddd");
  // }

  const patient = await Patient.findById(patientId);
  console.log("Patient found:", patient);
  if (!patient) {
    throw new Error("Patient not found");
  }
  ////console.log("Patient found:", patient);

  const newReading = new Glugose({ value, type, patient: patientId });
  await newReading.save();

  // Remove points logic

  return {
    message: "Reading saved successfully",
    reading: newReading,
  };
};

const getReadings = async (patientId) => {
  console.log(patientId);
  const readings = await Glugose.find({ patient: patientId });
  console.log(readings);
  return readings;
};

module.exports = { saveReading, getReadings };
