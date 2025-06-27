const Message = require("../model/Message");
const User = require("../model/User1");
const Doctor = require("../model/Doctor");

class ChatService {
  constructor() {
    this.connectedUsers = new Map(); // userId -> socket
    this.userSockets = new Map(); // socketId -> userId
  }

  // Add user to connected users
  addUser(userId, socket) {
    this.connectedUsers.set(userId, socket);
    this.userSockets.set(socket.id, userId);
    console.log(`User ${userId} connected. Total connected: ${this.connectedUsers.size}`);
  }

  // Remove user from connected users
  removeUser(socketId) {
    const userId = this.userSockets.get(socketId);
    if (userId) {
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socketId);
      console.log(`User ${userId} disconnected. Total connected: ${this.connectedUsers.size}`);
    }
  }

  // Get user's socket
  getUserSocket(userId) {
    return this.connectedUsers.get(userId);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Send message to multiple users
  sendToUsers(userIds, event, data) {
    const results = [];
    userIds.forEach(userId => {
      results.push(this.sendToUser(userId, event, data));
    });
    return results;
  }

  // Save message to database
  async saveMessage(senderId, receiverId, content, messageType = "text", fileUrl = null, fileName = null) {
    try {
      // Generate conversationId
      const userIds = [senderId.toString(), receiverId.toString()].sort();
      const conversationId = `${userIds[0]}_${userIds[1]}`;

      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType,
        fileUrl,
        fileName,
        conversationId,
      });

      await message.save();
      
      // Populate sender and receiver info
      await message.populate("sender", "fullname email role");
      await message.populate("receiver", "fullname email role");

      return message;
    } catch (error) {
      console.error("Error saving message:", error);
      throw new Error("Failed to save message");
    }
  }

  // Get conversation between two users
  async getConversation(user1Id, user2Id, limit = 50, skip = 0) {
    try {
      const messages = await Message.getConversation(user1Id, user2Id, limit, skip);
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw new Error("Failed to get conversation");
    }
  }

  // Mark messages as read
  async markMessagesAsRead(senderId, receiverId) {
    try {
      await Message.markAsRead(senderId, receiverId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw new Error("Failed to mark messages as read");
    }
  }

  // Get unread message count for user
  async getUnreadCount(userId) {
    try {
      return await Message.getUnreadCount(userId);
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw new Error("Failed to get unread count");
    }
  }

  // Get user's conversations list
  async getUserConversations(userId) {
    try {
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: userId },
              { receiver: userId }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: "$conversationId",
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { "lastMessage.createdAt": -1 }
        }
      ]);

      // Populate user information for each conversation
      const populatedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.lastMessage.sender.toString() === userId 
            ? conv.lastMessage.receiver 
            : conv.lastMessage.sender;

          const otherUser = await User.findById(otherUserId).select("fullname email role");
          
          return {
            conversationId: conv._id,
            otherUser: {
              _id: otherUser._id,
              fullname: otherUser.fullname,
              email: otherUser.email,
              role: otherUser.role,
            },
            lastMessage: {
              content: conv.lastMessage.content,
              messageType: conv.lastMessage.messageType,
              createdAt: conv.lastMessage.createdAt,
              sender: conv.lastMessage.sender,
            },
            unreadCount: conv.unreadCount,
          };
        })
      );

      return populatedConversations;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw new Error("Failed to get conversations");
    }
  }

  // Validate if users can chat (doctor-patient relationship)
  async validateChatPermission(user1Id, user2Id) {
    try {
      const user1 = await User.findById(user1Id);
      const user2 = await User.findById(user2Id);

      if (!user1 || !user2) {
        return { valid: false, message: "One or both users not found" };
      }

      // If both are patients or both are doctors, they can't chat
      if (user1.role === user2.role) {
        return { valid: false, message: "Patients can only chat with doctors and vice versa" };
      }

      // If it's a doctor-patient chat, check if they're associated
      if (user1.role === "doctor" && user2.role === "patient") {
        const doctor = await Doctor.findById(user1Id);
        if (!doctor || !doctor.patients.includes(user2Id)) {
          return { valid: false, message: "Doctor and patient are not associated" };
        }
      } else if (user1.role === "patient" && user2.role === "doctor") {
        const doctor = await Doctor.findById(user2Id);
        if (!doctor || !doctor.patients.includes(user1Id)) {
          return { valid: false, message: "Doctor and patient are not associated" };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error("Error validating chat permission:", error);
      return { valid: false, message: "Error validating chat permission" };
    }
  }
}

module.exports = new ChatService(); 