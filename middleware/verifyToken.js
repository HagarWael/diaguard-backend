const jwt = require("jsonwebtoken");
const ExpiredToken = require("../model/expiredToken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "access denied" });
    }

    const isBlacklisted = await ExpiredToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "token is expired " });
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(400).json({ message: "isnvalid token." });
  }
};

module.exports = verifyToken;
