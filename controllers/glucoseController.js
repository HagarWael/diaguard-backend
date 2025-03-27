const { saveReading, getReadings } = require("../service/glucoseService");

const saveReadingController = async (req, res) => {
  const { value, type } = req.body;

  if (!req.user.userId) {
    return res.status(401).json({ error: "user id not found in token." });
  }

  try {
    const result = await saveReading(req.user, value, type);
    res.status(200).json({ result });
  } catch (err) {
    console.error("Error in saving reading:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getReadingsController = async (req, res) => {
  const patientId = req.user.userId;

  try {
    const result = await getReadings(patientId);
    res.status(200).json({ result });
  } catch (err) {
    console.error("error fetching readings:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getReadingsController, saveReadingController };
