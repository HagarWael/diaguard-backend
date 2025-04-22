const mongoose = require("mongoose");
const expiredTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expired: {
    type: Date,
    expires: 60 * 60 * 24,
  },
});

module.exports = mongoose.model("ExpiredToken", expiredTokenSchema);
