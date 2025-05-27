const doctorService = require("../service/doctorService");
const Doctor = require("../model/Doctor");

const getPatients = async (req, res) => {
  try {
    const patients = await doctorService.getPatients(req.user.userId);
    res.status(200).json({ status: "success", patients });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await doctorService.getPatient(req.user._id, patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ status: "failed", message: "Patient not found" });
    }
    res.status(200).json({ status: "success", patient });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ status: "failed", message: "Message is required" });
    }

    const result = await doctorService.sendMessage(
      req.user._id,
      patientId,
      message
    );
    res
      .status(200)
      .json({ status: "success", message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { patientId } = req.params;
    const messages = await doctorService.getMessages(req.user._id, patientId);
    res.status(200).json({ status: "success", messages });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatient,
  sendMessage,
  getMessages,
};
