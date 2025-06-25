const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User1");
const secret = process.env.JWT_SECRET;
const Patient = require("../model/Patient");
const Doctor = require("../model/Doctor");
require("dotenv").config();

const registeredUser = async ({
  fullname,
  email,
  password,
  role,
  Code,
  emergencyContact,
  questions,
}) => {
  let user = await User.findOne({ email });
  if (user) throw new Error("User already exists");

  const hashedPass = await bcrypt.hash(password, 10);

  if (role === "doctor") {
    const chars =
      "asdfghjklpoiuytrewqzxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567890";
    const randomString = [...chars]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
      .join("");
    console.log("Received data:", { fullname, email, password, role });

    user = new Doctor({
      fullname,
      email,
      password: hashedPass,
      role,
      Code: randomString,
    });

    await user.save();
  } else if (role === "patient") {
    const doctor = await Doctor.findOne({ Code });
    if (!doctor) {
      throw new Error("Invalid doctor code");
    }

    // Validate emergency contact information
    if (
      !emergencyContact ||
      !emergencyContact.name ||
      !emergencyContact.phone
    ) {
      throw new Error("Emergency contact information is required for patients");
    }

    user = new Patient({
      fullname,
      email,
      password: hashedPass,
      role,
      doctor: doctor._id,
      emergencyContact: {
        name: emergencyContact.name,
        phone: emergencyContact.phone,
        relationship: emergencyContact.relationship || "Family Member",
      },
      question: Array.isArray(questions) ? questions : [],
    });

    await user.save();
    await Doctor.updateOne(
      { _id: doctor._id },
      { $push: { patients: user._id } }
    );
  } else {
    throw new Error("Invalid role");
  }
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
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
    { userId: user._id, email: user.email, role: user.role },
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
