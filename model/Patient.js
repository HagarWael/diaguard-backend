const mongoose = require("mongoose");
const User = require("./User1");

const patientSchema = new mongoose.Schema(
  {
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    diabetesType: { type: String, enum: ["type1", "type2"], required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Patient = User.discriminator("Patient", patientSchema);

module.exports = Patient;
