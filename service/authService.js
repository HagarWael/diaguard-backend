const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User1");
const secret = process.env.JWT_SECRET;
const Patient = require("../model/Patient");
const Doctor = require("../model/Doctor");
require("dotenv").config();

const registeredUser = async ({ fullname, email, password, role }) => {
  let user = await User.findOne({ email });
  if (user) throw new Error("User already exists");

  const hashedPass = await bcrypt.hash(password, 10);
  if (role === "patient" || role === "doctor") {
    user = new User({ fullname, email, password: hashedPass, role });
  } else {
    console.log("invalid role:", role);
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
