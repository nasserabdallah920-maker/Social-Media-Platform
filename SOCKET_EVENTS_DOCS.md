# 🔌 Socket.IO Events Documentation

This document explains all Socket.IO events used in the system, how to establish a connection, and the structure of the real-time data payloads exchanged between the Client and the Server.

---

## 🔐 1. Connection & Authentication

To connect to the Socket server, the client must provide a valid Access Token. It can be passed via `auth` or `headers` (passing it in the `auth` object is recommended):

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "Bearer YOUR_ACCESS_TOKEN"
  }
});
```

> [!IMPORTANT]
> Upon successful connection, the user automatically joins a personal room named `user-{id}` to receive personal notifications. Additionally, their followers are notified that they are now `online`.

---

## 📤 2. Client -> Server (Events emitted by the Client)

### 2.1 Message Delivered
Emitted when a user receives a message in the background or reads it.
- **Event Name:** `message-delivered`
- **Payload:**
```json
{
  "conversation_id": 123,
  "conversation_type": "direct" // or "group"
}
```

### 2.2 Message Seen
Emitted when a user opens the conversation and reads the messages.
- **Event Name:** `message-seen`
- **Payload:**
```json
{
  "conversation_id": 123,
  "conversation_type": "direct" // or "group"
}
```

### 2.3 Typing Indicator
Emitted when a user starts or stops typing a message.
- **Event Name:** `typing`
- **Payload:**
```json
{
  "conversation_id": 123,
  "is_typing": true // or false
}
```

---

## 📥 3. Server -> Client (Events received by the Client)

### 3.1 New Message
Received when a new message is sent in any of the user's conversations.
- **Event Name:** `new-message`
- **Payload:**
```json
{
  "message_id": 456,
  "sender_id": 1,
  "conversation_id": 123,
  "text": "Hello World",
  "file_url": "/uploads/image.png", // (Can be null)
  "sent_at": 1695583802000
}
```

### 3.2 Message Status Update
Received by the sender to indicate their message was delivered or seen.
- **Event Name:** `message-status`
- **Payload:**
```json
{
  "conversation_id": 123,
  "user_id": 2, // The ID of the user who received/read the message
  "status": "message received" // or "message seen"
}
```

### 3.3 User Typing
- **Event Name:** `typing`
- **Payload:**
```json
{
  "conversation_id": 123,
  "user_typing": 2, // The ID of the user currently typing
  "is_typing": true
}
```

### 3.4 Message Edited
- **Event Name:** `message-edit`
- **Payload:**
```json
{
  "conversation_id": 123,
  "user_id": 1,
  "message": {
    "id": 456,
    "text": "Updated text...",
    "conversation_id": 123
    // ... other message details
  }
}
```

### 3.5 Message Deleted
- **Event Name:** `message-delete`
- **Payload:**
```json
{
  "conversation_id": 123,
  "user_id": 1,
  "message_id": 456
}
```

### 3.6 Initial Online Friends
Received **only once** upon connecting to the socket. It contains a list of the user's followings who are currently online.
- **Event Name:** `online-users`
- **Payload:**
```json
[
  { "user_id": 3, "is_online": true },
  { "user_id": 7, "is_online": true }
]
```

### 3.7 Online User Status Update
Received when someone the user follows connects or disconnects.
- **Event Name:** `online-user`
- **Payload:**
```json
{
  "user_id": 3,
  "is_online": true // or false if disconnected
}
```

---

## 🔔 4. Real-time Notifications

The client receives all system notifications (likes, comments, follows, replies) via a single event named `notification`.

- **Event Name:** `notification`

### 4.1 Follow / Follow Request / Follow Accept
```json
{
  "id": 789,
  "type": "follow", // or "follow_request" or "follow_accept"
  "user": {
    "id": 2,
    "user_name": "ahmed",
    "avatar": "/uploads/avatar.jpg",
    "first_name": "Ahmed",
    "last_name": "Ali",
    "created_at": 1695583802000
  }
}
```

### 4.2 Post Like
```json
{
  "id": 790,
  "type": "like",
  "user": {
    "id": 3,
    "user_name": "mohamed",
    "avatar": "/uploads/avatar2.jpg",
    "first_name": "Mohamed",
    "last_name": "Kamal",
    "created_at": 1695583802000
  },
  "post": {
    "id": 10,
    "text": "My awesome post text"
  }
}
```

### 4.3 Post Comment
```json
{
  "id": 791,
  "type": "comment",
  "user": {
    "id": 4,
    "user_name": "sara",
    "avatar": "/uploads/sara.jpg",
    "first_name": "Sara",
    "last_name": "Mostafa",
    "created_at": 1695583802000
  },
  "post": {
    "id": 10,
    "text": "My awesome post text"
  },
  "comment": {
    "id": 50,
    "text": "Nice post!"
  }
}
```

### 4.4 Comment Reply
```json
{
  "id": 792,
  "type": "reply",
  "user": {
    "id": 5,
    "user_name": "omar",
    "avatar": "/uploads/omar.jpg",
    "first_name": "Omar",
    "last_name": "Sayed",
    "created_at": 1695583802000
  },
  "comment": {
    "id": 50,
    "text": "Nice post!" // The original comment
  },
  "reply": {
    "id": 99,
    "text": "Thanks!" // The reply to the comment
  }
}
```
