const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Patient = require("./Patient");
const GlugoseSchema = mongoose.Schema({
  value: { type: Number, required: true },
  type: { type: String, enum: ["before", "after"], required: true },
  date: { type: Date, default: Date.now },
  Patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
});
module.exports = model("Glugose", GlugoseSchema);
