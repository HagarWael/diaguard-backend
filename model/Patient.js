const mongoose = require("mongoose");
const User = require("./User1");

const patientSchema = new mongoose.Schema(
  {
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    diabetesType: { type: String, enum: ["type1", "type2"] },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  { timestamps: true }
);

const Patient = User.discriminator("patient", patientSchema);

module.exports = Patient;
