const userService = require("../service/userService");

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user, req.body);
    if (!updatedUser)
      return res.status(404).json({ message: "user not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile };
