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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    const result = await userService.changePassword(
      req.user,
      currentPassword,
      newPassword
    );
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const result = await userService.deleteAccount(req.user);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
};
