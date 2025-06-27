const jwt = require("jsonwebtoken");
const User = require("../model/User1");
const ExpiredToken = require("../model/expiredToken");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace("Bearer ", "");

    // Check if token is expired
    const expiredToken = await ExpiredToken.findOne({ token: cleanToken });
    if (expiredToken) {
      return next(new Error("Token has been expired"));
    }

    // Verify token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    } else {
      return next(new Error("Authentication failed"));
    }
  }
};

module.exports = socketAuth; 