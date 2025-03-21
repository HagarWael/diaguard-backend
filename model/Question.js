const mongoose = require("mongoose");
const QuestionSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionText: String,
        answers: String,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Question", QuestionSchema);
