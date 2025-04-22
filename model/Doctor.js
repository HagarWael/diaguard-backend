const mongoose = require("mongoose");
const User = require("./User1");

const doctorSchema = new mongoose.Schema({
  specialization: { type: String, default: "Diabetes" },
  uniqueCode: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = User.discriminator("Doctor", doctorSchema);
