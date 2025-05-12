const authService = require("../service/authService");

const registeredUser = async (req, res) => {
  try {
    const response = await authService.registeredUser(req.body);
    res.status(201).json({ response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const response = await authService.loginUser(req.body);
    res.status(200).json({ response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).json({ message: "no token found" });
    }

    await authService.logoutUser(token);

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "error" });
  }
};

module.exports = { registeredUser, loginUser, logout };