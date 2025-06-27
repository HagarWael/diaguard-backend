const { Server } = require("socket.io");
const socketAuth = require("../middleware/socketAuth");
const chatService = require("../service/chatService");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.fullname} (${socket.userId}) connected`);

    // Add user to connected users
    chatService.addUser(socket.userId, socket);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Send online status to user's contacts
    emitOnlineStatus(socket.userId, true);

    // Handle private message
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, content, messageType = "text", fileUrl = null, fileName = null } = data;

        if (!receiverId || !content) {
          socket.emit("error", { message: "Receiver ID and content are required" });
          return;
        }

        // Validate chat permission
        const permission = await chatService.validateChatPermission(socket.userId, receiverId);
        if (!permission.valid) {
          socket.emit("error", { message: permission.message });
          return;
        }

        // Save message to database
        const message = await chatService.saveMessage(
          socket.userId,
          receiverId,
          content,
          messageType,
          fileUrl,
          fileName
        );

        // Send message to receiver if online
        const receiverSocket = chatService.getUserSocket(receiverId);
        if (receiverSocket) {
          receiverSocket.emit("new_message", {
            message: {
              _id: message._id,
              sender: message.sender,
              receiver: message.receiver,
              content: message.content,
              messageType: message.messageType,
              fileUrl: message.fileUrl,
              fileName: message.fileName,
              isRead: message.isRead,
              createdAt: message.createdAt,
            },
          });
        }

        // Send confirmation to sender
        socket.emit("message_sent", {
          message: {
            _id: message._id,
            sender: message.sender,
            receiver: message.receiver,
            content: message.content,
            messageType: message.messageType,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            isRead: message.isRead,
            createdAt: message.createdAt,
          },
        });

        // Emit typing stopped
        socket.to(`user_${receiverId}`).emit("typing_stopped", { userId: socket.userId });

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing_start", async (data) => {
      try {
        const { receiverId } = data;
        
        // Validate chat permission
        const permission = await chatService.validateChatPermission(socket.userId, receiverId);
        if (!permission.valid) {
          return;
        }

        socket.to(`user_${receiverId}`).emit("typing_start", { userId: socket.userId });
      } catch (error) {
        console.error("Error handling typing start:", error);
      }
    });

    socket.on("typing_stop", async (data) => {
      try {
        const { receiverId } = data;
        
        // Validate chat permission
        const permission = await chatService.validateChatPermission(socket.userId, receiverId);
        if (!permission.valid) {
          return;
        }

        socket.to(`user_${receiverId}`).emit("typing_stopped", { userId: socket.userId });
      } catch (error) {
        console.error("Error handling typing stop:", error);
      }
    });

    // Handle read receipts
    socket.on("mark_read", async (data) => {
      try {
        const { senderId } = data;
        
        // Validate chat permission
        const permission = await chatService.validateChatPermission(socket.userId, senderId);
        if (!permission.valid) {
          return;
        }

        // Mark messages as read
        await chatService.markMessagesAsRead(senderId, socket.userId);

        // Notify sender that messages were read
        const senderSocket = chatService.getUserSocket(senderId);
        if (senderSocket) {
          senderSocket.emit("messages_read", { userId: socket.userId });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle user status
    socket.on("set_status", (data) => {
      const { status } = data;
      socket.user.status = status;
      emitOnlineStatus(socket.userId, true, status);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.fullname} (${socket.userId}) disconnected`);
      
      // Remove user from connected users
      chatService.removeUser(socket.id);
      
      // Emit offline status
      emitOnlineStatus(socket.userId, false);
    });
  });

  return io;
};

// Emit online/offline status to user's contacts
const emitOnlineStatus = async (userId, isOnline, status = null) => {
  try {
    // Get user's conversations to find contacts
    const conversations = await chatService.getUserConversations(userId);
    
    conversations.forEach(conversation => {
      const contactId = conversation.otherUser._id.toString();
      const contactSocket = chatService.getUserSocket(contactId);
      
      if (contactSocket) {
        contactSocket.emit("user_status_change", {
          userId,
          isOnline,
          status: status || (isOnline ? "online" : "offline"),
        });
      }
    });
  } catch (error) {
    console.error("Error emitting online status:", error);
  }
};

// Get IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
}; 