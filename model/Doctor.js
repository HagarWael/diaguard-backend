const mongoose = require("mongoose");
const User = require("./User1");

const doctorSchema = new mongoose.Schema({
  specialization: { type: String, default: "Diabetes" },
  Code: { type: String, unique: true, required: true },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = User.discriminator("doctor", doctorSchema);
