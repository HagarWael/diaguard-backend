const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
  getConversations,
  getConversation,
  markAsRead,
  getUnreadCount,
  getOnlineStatus,
  searchConversations,
  loadConversationHistory,
} = require("../controllers/chatController");

// All routes require authentication
router.use(verifyToken);

router.get("/conversations/:otherUserId/history", (req, res, next) => {
  console.log("HIT /chat/conversations/:otherUserId/history");
  next();
}, loadConversationHistory);

// Get user's conversations list
router.get("/conversations", checkRole(["patient", "doctor"]), getConversations);

// Load conversation history when entering chat
router.get("/conversations/:otherUserId/history", checkRole(["patient", "doctor"]), loadConversationHistory);

// Get conversation with specific user
router.get("/conversations/:otherUserId", checkRole(["patient", "doctor"]), getConversation);

// Mark messages as read from specific sender
router.put("/conversations/:senderId/read", checkRole(["patient", "doctor"]), markAsRead);

// Get unread message count
router.get("/unread-count", checkRole(["patient", "doctor"]), getUnreadCount);

// Get online status of users
router.post("/online-status", checkRole(["patient", "doctor"]), getOnlineStatus);

// Search conversations
router.get("/search", checkRole(["patient", "doctor"]), searchConversations);

module.exports = router; 