const Question = require("../model/Question");

const addAnswer = async (questionId, userId, answer) => {
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const newAnswer = {
      content: answer,
      user: userId,
      createdAt: new Date(),
    };

    question.answers.push(newAnswer);
    await question.save();

    return newAnswer;
  } catch (error) {
    throw new Error("Error adding answer");
  }
};

const updateAnswer = async (questionId, answerId, userId, newAnswer) => {
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }

    // Check if the user is the author of the answer
    if (answer.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized to update this answer");
    }

    answer.content = newAnswer;
    answer.updatedAt = new Date();

    await question.save();
    return answer;
  } catch (error) {
    throw new Error("Error updating answer");
  }
};

module.exports = {
  addAnswer,
  updateAnswer,
};
