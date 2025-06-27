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
    const { startDate, endDate } = req.query;
    
    let start, end;
    
    // If date parameters are provided, validate them
    if (startDate && endDate) {
      // Validate date format (ISO 8601 format)
      start = new Date(startDate);
      end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
          .status(400)
          .json({ 
            status: "failed", 
            message: "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00.000Z)" 
          });
      }

      if (start > end) {
        return res
          .status(400)
          .json({ 
            status: "failed", 
            message: "startDate must be before or equal to endDate" 
          });
      }
    }

    // If dates are provided, get patient with glucose readings
    if (startDate && endDate) {
      const result = await doctorService.getPatientWithGlucoseReadings(
        req.user.userId, 
        patientId, 
        start, 
        end
      );
      
      if (!result.patient) {
        return res
          .status(404)
          .json({ status: "failed", message: "Patient not found" });
      }

      console.log('Returning response:', {
        status: "success",
        patient: result.patient,
        glucoseReadings: result.glucoseReadings,
        dateRange: {
          startDate: startDate,
          endDate: endDate
        }
      });
      
      return res.status(200).json({ 
        status: "success", 
        patient: result.patient,
        glucoseReadings: result.glucoseReadings,
        dateRange: {
          startDate: startDate,
          endDate: endDate
        }
      });
    } else {
      // If no dates provided, just get patient details
      const patient = await doctorService.getPatient(req.user.userId, patientId);
      
      if (!patient) {
        return res
          .status(404)
          .json({ status: "failed", message: "Patient not found" });
      }
      
      return res.status(200).json({ 
        status: "success", 
        patient: patient
      });
    }
  } catch (error) {
    console.error('Error in getPatient:', error);
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
      req.user.userId,
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
    const messages = await doctorService.getMessages(req.user.userId, patientId);
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
