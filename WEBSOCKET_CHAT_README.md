# WebSocket Chat System

This document explains the real-time chat functionality implemented between patients and doctors using WebSocket (Socket.IO).

## Features

### ✅ Real-time Messaging
- Instant message delivery between patients and doctors
- Typing indicators
- Read receipts
- Online/offline status

### ✅ Security & Validation
- JWT authentication for WebSocket connections
- Doctor-patient relationship validation
- Message permission checks
- Secure token handling

### ✅ Message Types
- Text messages
- File attachments (PDF, images)
- Message status tracking (sent, delivered, read)

### ✅ Advanced Features
- Conversation history
- Unread message counts
- Search conversations
- Pagination support
- Message timestamps

## Setup

### 1. Environment Variables

Add to your `.env` file:
```env
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

### 2. Dependencies

The following dependencies are automatically installed:
- `socket.io` - WebSocket server
- `jsonwebtoken` - JWT authentication
- `mongoose` - Database operations

## WebSocket Events

### Client to Server Events

#### Connect
```javascript
// Connect with authentication
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

#### Send Message
```javascript
socket.emit('send_message', {
  receiverId: 'doctor_user_id',
  content: 'Hello doctor!',
  messageType: 'text', // 'text', 'file', 'image'
  fileUrl: null, // Optional: for file/image messages
  fileName: null  // Optional: for file/image messages
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', {
  receiverId: 'doctor_user_id'
});

// Stop typing
socket.emit('typing_stop', {
  receiverId: 'doctor_user_id'
});
```

#### Mark Messages as Read
```javascript
socket.emit('mark_read', {
  senderId: 'doctor_user_id'
});
```

#### Set User Status
```javascript
socket.emit('set_status', {
  status: 'available' // 'available', 'busy', 'away'
});
```

### Server to Client Events

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message received:', data.message);
  // data.message contains: _id, sender, receiver, content, messageType, fileUrl, fileName, isRead, createdAt
});
```

#### Message Sent Confirmation
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent successfully:', data.message);
});
```

#### Typing Indicators
```javascript
socket.on('typing_start', (data) => {
  console.log('User is typing:', data.userId);
});

socket.on('typing_stopped', (data) => {
  console.log('User stopped typing:', data.userId);
});
```

#### Read Receipts
```javascript
socket.on('messages_read', (data) => {
  console.log('Messages read by:', data.userId);
});
```

#### User Status Changes
```javascript
socket.on('user_status_change', (data) => {
  console.log('User status changed:', data);
  // data contains: userId, isOnline, status
});
```

#### Error Events
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

## REST API Endpoints

### Chat Routes (`/chat`)

#### Get Conversations List
- **GET** `/chat/conversations`
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "user1_user2",
      "otherUser": {
        "_id": "user_id",
        "fullname": "Dr. John Doe",
        "email": "john@example.com",
        "role": "doctor"
      },
      "lastMessage": {
        "content": "Hello!",
        "messageType": "text",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "sender": "user_id"
      },
      "unreadCount": 2
    }
  ]
}
```

#### Get Conversation with User
- **GET** `/chat/conversations/:otherUserId?limit=50&skip=0`
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "message_id",
      "sender": {
        "_id": "sender_id",
        "fullname": "John Doe",
        "email": "john@example.com",
        "role": "patient"
      },
      "receiver": {
        "_id": "receiver_id",
        "fullname": "Dr. Smith",
        "email": "smith@example.com",
        "role": "doctor"
      },
      "content": "Hello doctor!",
      "messageType": "text",
      "fileUrl": null,
      "fileName": null,
      "isRead": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Mark Messages as Read
- **PUT** `/chat/conversations/:senderId/read`
- **Authentication:** Required

#### Get Unread Count
- **GET** `/chat/unread-count`
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

#### Get Online Status
- **POST** `/chat/online-status`
- **Body:** `{ "userIds": ["user1", "user2"] }`
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user1",
      "isOnline": true
    },
    {
      "userId": "user2",
      "isOnline": false
    }
  ]
}
```

#### Search Conversations
- **GET** `/chat/search?query=doctor`
- **Authentication:** Required

### User Routes (`/users`) - For Patients

#### Send Message to Doctor
- **POST** `/users/send-message`
- **Body:**
```json
{
  "doctorId": "doctor_user_id",
  "content": "Hello doctor!",
  "messageType": "text",
  "fileUrl": null,
  "fileName": null
}
```
- **Authentication:** Required (Patient only)

#### Get Patient's Conversations
- **GET** `/users/conversations`
- **Authentication:** Required (Patient only)

#### Get Conversation with Doctor
- **GET** `/users/conversations/:doctorId?limit=50&skip=0`
- **Authentication:** Required (Patient only)

#### Mark Messages as Read
- **PUT** `/users/conversations/:doctorId/read`
- **Authentication:** Required (Patient only)

#### Get Unread Count
- **GET** `/users/unread-count`
- **Authentication:** Required (Patient only)

### Doctor Routes (`/doctors`) - For Doctors

#### Send Message to Patient
- **POST** `/doctors/patients/:patientId/messages`
- **Body:** `{ "message": "Hello patient!" }`
- **Authentication:** Required (Doctor only)

#### Get Messages with Patient
- **GET** `/doctors/patients/:patientId/messages`
- **Authentication:** Required (Doctor only)

## Database Schema

### Message Model
```javascript
{
  sender: ObjectId, // Reference to User
  receiver: ObjectId, // Reference to User
  content: String, // Message content
  messageType: String, // 'text', 'file', 'image'
  fileUrl: String, // Optional: file URL
  fileName: String, // Optional: file name
  isRead: Boolean, // Read status
  readAt: Date, // When message was read
  conversationId: String, // Auto-generated conversation ID
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### Authentication
- JWT token validation for all WebSocket connections
- Token expiration checking
- User verification from database

### Authorization
- Doctor-patient relationship validation
- Role-based access control
- Message permission checks

### Data Validation
- Message content length limits
- File type validation
- Input sanitization

## Error Handling

### WebSocket Errors
- Authentication failures
- Permission denied errors
- Invalid message format
- Database operation failures

### REST API Errors
- Standard HTTP status codes
- Detailed error messages
- Validation error responses

## Usage Examples

### Frontend Implementation (JavaScript)

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt_token')
  }
});

// Listen for new messages
socket.on('new_message', (data) => {
  displayMessage(data.message);
});

// Send a message
function sendMessage(receiverId, content) {
  socket.emit('send_message', {
    receiverId,
    content,
    messageType: 'text'
  });
}

// Handle typing indicators
let typingTimeout;
function handleTyping(receiverId) {
  socket.emit('typing_start', { receiverId });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', { receiverId });
  }, 1000);
}
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useChat = (token) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:3000', {
        auth: { token }
      });

      newSocket.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      newSocket.on('typing_start', (data) => {
        setIsTyping(true);
      });

      newSocket.on('typing_stopped', (data) => {
        setIsTyping(false);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [token]);

  const sendMessage = (receiverId, content) => {
    if (socket) {
      socket.emit('send_message', {
        receiverId,
        content,
        messageType: 'text'
      });
    }
  };

  return { socket, messages, isTyping, sendMessage };
};
```

## Performance Considerations

### Database Indexing
- Compound indexes on sender/receiver fields
- Index on conversationId for efficient queries
- Index on createdAt for chronological ordering

### WebSocket Optimization
- Connection pooling
- Message batching for high-frequency updates
- Efficient room management

### Caching
- Redis integration for session management
- Message caching for frequently accessed conversations

## Monitoring & Logging

### Connection Monitoring
- Real-time user connection tracking
- Connection/disconnection logging
- Performance metrics

### Message Tracking
- Message delivery confirmation
- Read receipt tracking
- Error logging and monitoring

## Future Enhancements

### Planned Features
- Message encryption
- File upload progress tracking
- Message reactions
- Group chat support
- Voice/video calling integration
- Message search functionality
- Push notifications
- Message archiving

### Scalability
- Horizontal scaling support
- Load balancing for WebSocket servers
- Database sharding strategies
- CDN integration for file storage 