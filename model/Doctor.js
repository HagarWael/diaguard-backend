const mongoose = require("mongoose");
const User = require("./User1");

const doctorSchema = new mongoose.Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Doctor = User.discriminator("Doctor", doctorSchema);

module.exports = Doctor;
