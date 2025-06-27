const jwt = require("jsonwebtoken");
const ExpiredToken = require("../model/expiredToken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  console.log("DEBUG: Verifying token");
  try {
    let token = req.header("Authorization");
    console.log("DEBUG: Token received:", token);

    if (!token) {
      return res.status(401).json({ message: "access denied" });
    }

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    const isBlacklisted = await ExpiredToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "token is expired " });
    }

    const decoded = jwt.verify(token, secret);
    console.log("DEBUG: Decoded token:", decoded);

    // Check if the token is expired
    const isExpired = await ExpiredToken.findOne({ token });
    if (isExpired) {
      return res.status(401).json({ message: "Token is expired" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(400).json({ message: "Invalid token" });
    }
  }
};

module.exports = verifyToken;
