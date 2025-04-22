const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User1");
const secret = process.env.JWT_SECRET;
const Patient = require("../model/Patient");
const Doctor = require("../model/Doctor");
require("dotenv").config();
const ExpiredToken = require("../model/expiredToken");

const registeredUser = async ({
  fullname,
  email,
  password,
  role,
  doctorCode,
}) => {
  let user = await User.findOne({ email });
  if (user) throw new Error("already exists");

  const hashedPass = await bcrypt.hash(password, 10);

  if (role === "doctor") {
    const generateUniqueCode = () => {
      return "DR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const uniqueCode = generateUniqueCode();

    user = new Doctor({
      fullname,
      email,
      password: hashedPass,
      role,
      uniqueCode,
    });
  } else if (role === "patient") {
    if (!doctorCode) throw new Error("doc code is required");

    const doctor = await Doctor.findOne({ uniqueCode: doctorCode });
    if (!doctor) throw new Error("doc not found with this code");

    user = new Patient({
      fullname,
      email,
      password: hashedPass,
      role,
      doctor: doctor._id,
    });
  } else {
    throw new Error("Invalid role");
  }

  await user.save();
  console.log("user registered:", user);

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { message: "user registered successfully", token, user };
};

const loginUser = async ({ email, password }) => {
  let user = await User.findOne({ email });
  if (!user) {
    console.log("user not found in the database");
    return { error: "incorrect username or password" };
  }

  console.log("not found:", user);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "incorrect username or password" };
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  console.log("token generated:", token);
  return {
    token,
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
  };
};
const logoutUser = async (token) => {
  const expiredToken = new ExpiredToken({ token });
  await expiredToken.save();
  return { message: "logout successfully" };
};

module.exports = { registeredUser, loginUser, logoutUser };
