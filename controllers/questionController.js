const questionService = require("../service/questionService");

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

module.exports = {
  addAnswers,
  updateAnswers,
};
