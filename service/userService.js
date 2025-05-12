const User = require("../model/User1");
const bcrypt = require("bcrypt");
const redisCache = require("../config/redisCache");

const getUserProfile = async (user) => {
  const cacheKey = `user.profile=${user.email}`;

  const cachedUser = await redisCache.getUserProfile(cacheKey);
  if (cachedUser) {
    console.log("Serving from cache");
    return cachedUser;
  }

  let userProfile;
  if (user.role === "patient") {
    userProfile = await User.findOne({ email: user.email })
      .populate("doctor")
      .select("-password");
  } else if (user.role === "patient") {
    userProfile = await User.findOne({ email: user.email })
      .populate("doctor")
      .select("-password");
  }

  if (!userProfile) return null;
  await redisCache.setUserProfile(cacheKey, userProfile);

  console.log("Serving from db");
  return userProfile;
};

const updateUserProfile = async (user, updateData) => {
  try {
    const allowedUpdates = ["name", "email", "phone", "address"];
    const updates = Object.keys(updateData)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    const cacheKey = `user.profile=${user.email}`;
    await redisCache.clearUserProfile(cacheKey);

    return updatedUser;
  } catch (error) {
    throw new Error("Error updating user profile");
  }
};

const changePassword = async (user, currentPassword, newPassword) => {
  try {
    const userDoc = await User.findById(user._id);
    const isMatch = await bcrypt.compare(currentPassword, userDoc.password);

    if (!isMatch) {
      return { success: false, message: "Current password is incorrect" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    return { success: true };
  } catch (error) {
    throw new Error("Error changing password");
  }
};

const deleteAccount = async (user) => {
  try {
    const result = await User.findByIdAndDelete(user._id);
    if (!result) {
      return { success: false, message: "User not found" };
    }
    return { success: true };
  } catch (error) {
    throw new Error("Error deleting account");
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
};
