const chatService = require("../service/chatService");
const User = require("../model/User1");

// Get user's conversations list
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await chatService.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversations",
    });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.userId;
    const { limit = 50, skip = 0 } = req.query;

    // Validate chat permission
    const permission = await chatService.validateChatPermission(userId, otherUserId);
    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }
    console.log("DEBUG: Other user ID:", otherUserId);

    const messages = await chatService.getConversation(userId, otherUserId, parseInt(limit), parseInt(skip));
    console.log("DEBUG: Messages:", messages);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversation",
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user.userId;

    // Validate chat permission
    const permission = await chatService.validateChatPermission(userId, senderId);
    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    await chatService.markMessagesAsRead(senderId, userId);

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await chatService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};

// Get online status of users
const getOnlineStatus = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: "userIds must be an array",
      });
    }

    const statuses = userIds.map(userId => ({
      userId,
      isOnline: chatService.isUserOnline(userId),
    }));

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error getting online status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get online status",
    });
  }
};

// Search conversations
const searchConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const conversations = await chatService.getUserConversations(userId);
    
    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conversation => 
      conversation.otherUser.fullname.toLowerCase().includes(query.toLowerCase()) ||
      conversation.otherUser.email.toLowerCase().includes(query.toLowerCase()) ||
      conversation.lastMessage.content.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      data: filteredConversations,
    });
  } catch (error) {
    console.error("Error searching conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search conversations",
    });
  }
};

// Load conversation history when entering chat
const loadConversationHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.userId;
    const { limit = 50, skip = 0 } = req.query;

    console.log("DEBUG: Loading conversation history for users:", userId, otherUserId);

    // 1. Permission check
    console.log("DEBUG: Before validateChatPermission");
    const permission = await chatService.validateChatPermission(userId, otherUserId);
    console.log("DEBUG: After validateChatPermission:", permission);

    if (!permission.valid) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    // 2. Get conversation
    console.log("DEBUG: Before getConversation");
    const messages = await chatService.getConversation(userId, otherUserId, parseInt(limit), parseInt(skip));
    console.log("DEBUG: After getConversation:", messages.length);

    // 3. Mark as read
    console.log("DEBUG: Before markMessagesAsRead");
    await chatService.markMessagesAsRead(otherUserId, userId);
    console.log("DEBUG: After markMessagesAsRead");

    // 4. Get other user info
    console.log("DEBUG: Before User.findById");
    const otherUser = await User.findById(otherUserId).select("fullname email role");
    console.log("DEBUG: After User.findById:", otherUser);

    res.json({
      success: true,
      data: {
        messages,
        otherUser: {
          _id: otherUser._id,
          fullname: otherUser.fullname,
          email: otherUser.email,
          role: otherUser.role,
        },
        conversationId: `${[userId, otherUserId].sort().join('_')}`,
      },
    });
  } catch (error) {
    console.error("Error loading conversation history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load conversation history",
    });
  }
};

module.exports = {
  getConversations,
  getConversation,
  markAsRead,
  getUnreadCount,
  getOnlineStatus,
  searchConversations,
  loadConversationHistory,
}; 