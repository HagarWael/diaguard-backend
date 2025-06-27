const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    conversationId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient querying of conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Pre-save middleware to generate conversationId
messageSchema.pre("save", function (next) {
  if (!this.conversationId) {
    // Create a consistent conversation ID by sorting user IDs
    const userIds = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = `${userIds[0]}_${userIds[1]}`;
  }
  next();
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = function (user1Id, user2Id, limit = 50, skip = 0) {
  const userIds = [user1Id.toString(), user2Id.toString()].sort();
  const conversationId = `${userIds[0]}_${userIds[1]}`;
  console.log("DEBUG: getConversation called with conversationId:", conversationId);
  return this.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    // .populate("sender", "fullname email role")
    // .populate("receiver", "fullname email role")
    .lean();
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function (senderId, receiverId) {
  const userIds = [senderId.toString(), receiverId.toString()].sort();
  const conversationId = `${userIds[0]}_${userIds[1]}`;
  
  return this.updateMany(
    {
      conversationId,
      sender: senderId,
      receiver: receiverId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
  });
};

module.exports = mongoose.model("Message", messageSchema); 