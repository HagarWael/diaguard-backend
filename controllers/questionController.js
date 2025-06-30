const questionService = require("../service/questionService");
const User = require("../model/User1");

const addAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        status: "failed",
        message: "Answer content is required",
      });
    }

    const result = await questionService.addAnswer(
      questionId,
      req.user._id,
      answer
    );
    res.status(200).json({
      status: "success",
      message: "Answer added successfully",
      answer: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const updateAnswers = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        status: "failed",
        message: "Answer content is required",
      });
    }

    const result = await questionService.updateAnswer(
      questionId,
      answerId,
      req.user._id,
      answer
    );

    if (!result) {
      return res.status(404).json({
        status: "failed",
        message: "Answer not found or unauthorized",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Answer updated successfully",
      answer: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const saveAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const answers = req.body.answers; // [{questionText, answer}, ...]
    await User.findByIdAndUpdate(userId, { $set: { question: answers } });
    res.json({ message: "Answers saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnswers = async (req, res) => {
  try {
    // Default: get answers for the logged-in user
    let userId = req.user.userId;

    // If the logged-in user is a doctor and a userId is provided in the query, fetch for that patient
    if (req.user.role === 'doctor' && req.query.userId) {
      userId = req.query.userId;
    }

    const user = await User.findById(userId);
    console.log({ question: user.question });
    res.json({ question: user.question || [] });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addAnswers,
  updateAnswers,
  saveAnswers,
  getAnswers,
};
