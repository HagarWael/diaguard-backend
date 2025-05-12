const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor"],
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    question: [
      {
        questionText: String,
        answer: String,
      },
    ],
  },
  { timestamps: true, discriminatorKey: "role" }
);

module.exports = mongoose.model("User", userSchema);
