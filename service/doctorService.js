const User = require("../model/User1");
const Patient = require("../model/Patient");
const Doctor = require("../model/Doctor");
//const Message = require("../model/Message");
const Glucose = require("../model/Glugose");

const getPatientsByDoctorCode = async (Code) => {
  try {
    // Find all patients with the given doctor code
    const patients = await User.find({ role: "patient", Code });
    return patients;
  } catch (error) {
    throw new Error("Error fetching patients");
  }
};

const getPatients = async (doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId).populate({
      path: "patients",
      select: "fullname email phone emergencyContact",
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Get the last glucose reading for each patient
    const patientsWithReadings = await Promise.all(
      doctor.patients.map(async (patient) => {
        const lastReading = await Glucose.findOne(
          { patient: patient._id },
          { value: 1, type: 1 }
        )
          .sort({ date: -1 })
          .limit(1);
        console.log({_id: patient._id,
          name: patient.fullname,
          lastReading: lastReading
            ? {
                value: lastReading.value,
                type: lastReading.type,
              }
            : null,})
        return {
          _id: patient._id,
          name: patient.fullname,
          lastReading: lastReading
            ? {
                value: lastReading.value,
                type: lastReading.type,
              }
            : null,
        };
      })
    );

    return patientsWithReadings;
  } catch (error) {
    throw new Error("Error fetching patients");
  }
};

const getPatient = async (doctorId, patientId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (!doctor.patients.includes(patientId)) {
      throw new Error("Patient not associated with this doctor");
    }

    const patient = await User.findById(patientId).select("-password");
    return patient;
  } catch (error) {
    throw new Error("Error fetching patient details");
  }
};

const getPatientWithGlucoseReadings = async (doctorId, patientId, startDate, endDate) => {
  try {
    console.log('getPatientWithGlucoseReadings called with:', { doctorId, patientId, startDate, endDate });
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (!doctor.patients.includes(patientId)) {
      throw new Error("Patient not associated with this doctor");
    }

    const patient = await User.findById(patientId).select("-password");
    console.log('Patient found:', patient ? 'yes' : 'no');
    
    // Get glucose readings within the date range
    const glucoseReadings = await Glucose.find({
      patient: patientId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    console.log('Glucose readings found:', glucoseReadings.length);

    return {
      patient,
      glucoseReadings
    };
  } catch (error) {
    console.error('Error in getPatientWithGlucoseReadings:', error);
    throw new Error("Error fetching patient details and glucose readings");
  }
};

const sendMessage = async (doctorId, patientId, message) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (!doctor.patients.includes(patientId)) {
      throw new Error("Patient not associated with this doctor");
    }

    const newMessage = new Message({
      sender: doctorId,
      receiver: patientId,
      content: message,
      senderType: "doctor",
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    throw new Error("Error sending message");
  }
};

const getMessages = async (doctorId, patientId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (!doctor.patients.includes(patientId)) {
      throw new Error("Patient not associated with this doctor");
    }

    const messages = await Message.find({
      $or: [
        { sender: doctorId, receiver: patientId },
        { sender: patientId, receiver: doctorId },
      ],
    }).sort({ createdAt: 1 });

    return messages;
  } catch (error) {
    throw new Error("Error fetching messages");
  }
};

module.exports = {
  getPatientsByDoctorCode,
  getPatients,
  getPatient,
  getPatientWithGlucoseReadings,
  sendMessage,
  getMessages,
};
