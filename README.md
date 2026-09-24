# Social Media API — Back-end

A RESTful back-end for a social media application, built with **Node.js**, **Express 5**, **MySQL**, and **Redis**, with real-time messaging and notifications powered by **Socket.IO**.

Users can register, build a profile, follow each other (with private-account approval), publish posts with media, like and comment, chat in direct or group conversations, and receive live notifications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Database](#database)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Real-time (Socket.IO)](#real-time-socketio)
- [File Uploads](#file-uploads)
- [Testing](#testing)
- [Security](#security)

---

## Features

- **Authentication** — register, login, logout, JWT access/refresh tokens, change password, and reset password via email.
- **Users & Profiles** — edit account info, bio, avatar, and toggle account privacy (public/private).
- **Relations** — follow / unfollow, block / unblock, and follow requests (accept / reject) for private accounts.
- **Posts** — create posts with multiple images/files, edit text, add or remove files, delete posts.
- **Likes, Comments & Replies** — toggle likes, comment with an optional image, and reply to comments.
- **Feed & Search** — paginated feed of posts from people you follow, plus search across users and posts.
- **Messaging** — direct and group conversations, file messages, edit/delete messages, typing indicators, and delivered/seen status.
- **Notifications** — real-time notifications (follow, follow request, like, comment) with read/unread management.
- **Online presence** — followers are notified when a user goes online or offline.
- **Blocking & privacy enforcement** — blocked users cannot view content or message each other; private profiles are visible only to followers.
- **Caching** — Redis caches frequently read users and posts.
- **API documentation** — interactive Swagger UI.
- **Tests** — unit tests for controllers, services, and utilities using Jest.

## Tech Stack

| Area            | Technology                                   |
| --------------- | -------------------------------------------- |
| Runtime         | Node.js 24 (CommonJS)                        |
| Framework       | Express 5                                    |
| Database        | MySQL 8 (`mysql2`)                           |
| Cache           | Redis 7 (`redis`)                            |
| Real-time       | Socket.IO 4                                  |
| Auth            | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Validation      | Zod                                          |
| File uploads    | Multer                                       |
| Email           | Nodemailer (Gmail)                           |
| Security        | Helmet, CORS, `express-rate-limit`           |
| API docs        | `swagger-jsdoc` + `swagger-ui-express`       |
| Testing         | Jest, Supertest                              |
| Containerization| Docker, Docker Compose                       |

## Project Structure

The code follows a layered architecture:
`routes → validators/middlewares → controllers → services → repositories → database`.

```
.
├── app.js                  # Express app, middlewares, Swagger, Socket.IO setup
├── main.js                 # Server entry point
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── src
    ├── config/             # MySQL pool and Redis client
    ├── routes/             # Route definitions (mounted under /api)
    ├── validators/         # Zod schemas for request validation
    ├── middlewares/        # auth, block check, validation, error handling, socket auth
    ├── controllers/        # HTTP request/response handling
    ├── services/           # Business logic
    ├── repositories/       # SQL queries
    ├── socket/             # Socket.IO server, event handlers, io manager
    ├── emails/             # Nodemailer transporter
    ├── utils/              # JWT, bcrypt, multer, AppError, status codes, helpers
    ├── docs/               # Swagger definitions (*.docs.js)
    ├── uploads/            # Uploaded files (served statically)
    └── testing/            # Jest tests (controllers, services, utils)
```

## Getting Started

### Prerequisites

- Node.js 24 (or a recent LTS version)
- MySQL 8+
- Redis 7+
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833) (only needed for the reset-password email)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill in the values
cp .env.example .env

# 3. Create the MySQL database and tables (see the Database section)

# 4. Start the server in development mode (nodemon)
npm run server

# ...or start it directly
node main.js
```

The API is served at `http://localhost:<SERVER_PORT>/api` (default port `3000` if `SERVER_PORT` is not set).
Swagger UI is available at `http://localhost:<SERVER_PORT>/api-docs`.

## Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

| Variable              | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `SERVER_PORT`         | Port the server listens on (defaults to `3000`)                   |
| `DB_HOST`             | MySQL host (defaults to `localhost`)                              |
| `DB_PORT`             | MySQL port (defaults to `3306`)                                   |
| `DB_USER`             | MySQL user (defaults to `root`)                                   |
| `DB_PASSWORD`         | MySQL password                                                    |
| `DB_NAME`             | MySQL database name (defaults to `social_media`)                  |
| `JWT_ACCESS_SECRET`   | Secret used to sign access tokens                                 |
| `JWT_REFRESH_SECRET`  | Secret used to sign refresh tokens                                |
| `BCRYPT_SALT_ROUNDS`  | Number of bcrypt salt rounds (e.g. `10`)                          |
| `CLIENT_URL`          | Front-end origin allowed by CORS and Socket.IO                    |
| `EMAIL_NODEMAILER`    | Gmail address used to send emails                                 |
| `PASS_NODEMAILER`     | Gmail app password                                                |
| `REDIS_URL`           | Redis connection URL (e.g. `redis://localhost:6379`)              |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

## Running with Docker

The repository ships with a `Dockerfile` and a `docker-compose.yml` that start the API together with MySQL and Redis.

```bash
docker compose up --build
```

For the containers to talk to each other, set these values in `.env`:

```env
SERVER_PORT=4000          # the Dockerfile exposes and compose maps port 4000
DB_HOST=db
REDIS_URL=redis://redis:6379
```

The API will be available at `http://localhost:4000/api`.

## Database

The application uses a MySQL database (default name: `social_media`). The SQL schema is not part of this repository, so make sure the following tables exist before running the app:

| Table                  | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `users`                | Accounts and credentials (incl. refresh token) |
| `profiles`             | Bio, avatar, and privacy flag (`is_private`) |
| `follows`              | Follower → following relationships           |
| `requests`             | Pending follow requests for private accounts |
| `blocks`               | Blocker → blocked relationships              |
| `posts`                | User posts                                   |
| `post_images`          | Files attached to posts                      |
| `likes`                | Post likes                                   |
| `comments`             | Post comments                                |
| `comment_images`       | Images attached to comments                  |
| `comment_replies`      | Replies to comments                          |
| `conversations`        | Direct and group conversations               |
| `conversation_members` | Conversation participants                    |
| `messages`             | Chat messages (text/file, delivered/seen state) |
| `notifications`        | User notifications                           |

## Authentication

- **Access token** — a JWT valid for **15 minutes**. Send it on every protected request:

  ```
  Authorization: Bearer <access_token>
  ```

- **Refresh token** — a JWT valid for **7 days**, stored in an `httpOnly` cookie (`refresh_token`) and also saved on the user record. Call `POST /api/auth/refresh` to get a new access token.
- Logging out clears the cookie and invalidates the stored refresh token.

## API Reference

All routes are prefixed with `/api`. Every route except register, login, refresh, and the password-reset endpoints requires authentication. Full request/response schemas are available in **Swagger UI** at `/api-docs`.

### Auth — `/api/auth`

| Method | Endpoint           | Description                           |
| ------ | ------------------ | ------------------------------------- |
| POST   | `/register`        | Create a new account                  |
| POST   | `/login`           | Log in                                |
| POST   | `/logout`          | Log out                               |
| POST   | `/refresh`         | Get a new access token                |
| POST   | `/change/password` | Change password (old + new)           |
| POST   | `/reset/email`     | Send a password-reset email           |
| POST   | `/reset/password`  | Reset password (`?id=<user_id>`)      |

### Users — `/api/users`

| Method | Endpoint        | Description                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/get/:id`      | Get a user's details                 |
| PATCH  | `/update/info`  | Update first name, last name, username |
| DELETE | `/delete`       | Delete the current account           |

### Profiles — `/api/profiles`

| Method | Endpoint   | Description                        |
| ------ | ---------- | ---------------------------------- |
| PUT    | `/bio`     | Update bio                         |
| PUT    | `/avatar`  | Update avatar (`avatar` file field)|
| PATCH  | `/privacy` | Toggle public / private account    |

### Relations — `/api/relations`

| Method | Endpoint                        | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| POST   | `/follow/:following_id`         | Follow a user (or send a request)  |
| POST   | `/unfollow/:following_id`       | Unfollow / cancel a request        |
| POST   | `/block/:blocked_id`            | Block a user                       |
| POST   | `/unblock/:blocked_id`          | Unblock a user                     |
| POST   | `/request/accept/:from_user_id` | Accept a follow request            |
| POST   | `/request/reject/:from_user_id` | Reject a follow request            |
| GET    | `/followers/:user_id`           | List a user's followers            |
| GET    | `/following/:user_id`           | List who a user follows            |
| GET    | `/status/:user_id`              | Relation status with a user        |
| GET    | `/requests/pending`             | List pending follow requests       |

### Posts — `/api/posts`

| Method | Endpoint              | Description                                   |
| ------ | --------------------- | --------------------------------------------- |
| POST   | `/create`             | Create a post (`text`, files in `post_files`) |
| GET    | `/user/:user_id`      | Get a user's posts (paginated)                |
| GET    | `/:id`                | Get a single post                             |
| PATCH  | `/update/:id`         | Edit post text                                |
| PATCH  | `/update/files/:id`   | Add files to a post                           |
| DELETE | `/delete/:id`         | Delete a post                                 |
| DELETE | `/delete/:id/file`    | Remove a file from a post                     |

### Likes — `/api/likes`

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/toggle/:post_id` | Like / unlike a post    |
| GET    | `/post/:post_id`   | List a post's likes     |

### Comments — `/api/comments`

| Method | Endpoint             | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| POST   | `/create/:post_id`   | Add a comment (optional `image_comment` file)|
| GET    | `/post/:post_id`     | List a post's comments                       |
| PATCH  | `/update/:id`        | Edit a comment                               |
| DELETE | `/delete/:id`        | Delete a comment                             |

### Replies — `/api/replies`

| Method | Endpoint                | Description                     |
| ------ | ----------------------- | ------------------------------- |
| POST   | `/create/:comment_id`   | Reply to a comment (optional `image` file) |
| GET    | `/comment/:comment_id`  | List a comment's replies        |
| PATCH  | `/update/:id`           | Edit a reply                    |
| DELETE | `/delete/:id`           | Delete a reply                  |

### Feed & Search — `/api/feed`

| Method | Endpoint  | Description                                         |
| ------ | --------- | --------------------------------------------------- |
| GET    | `/posts`  | Feed of posts from people you follow (`page`, `limit`) |
| GET    | `/?q=`    | Search users and posts                              |

### Conversations — `/api/conversations`

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/`                 | List your conversations        |
| POST   | `/direct/:user_id`  | Start a direct conversation    |
| POST   | `/creat-group`      | Create a group conversation    |
| DELETE | `/:conversation_id` | Delete a conversation          |

### Messages — `/api/messages`

| Method | Endpoint                          | Description                                |
| ------ | --------------------------------- | ------------------------------------------ |
| GET    | `/:conversation_id`               | Get messages (`page`, `limit`)             |
| POST   | `/new/:conversation_id`           | Send a message (text and/or `file` field)  |
| PATCH  | `/:message_id`                    | Edit a message                             |
| DELETE | `/:message_id/:conversation_id`   | Delete a message                           |

### Notifications — `/api/notifications`

| Method | Endpoint        | Description                     |
| ------ | --------------- | ------------------------------- |
| GET    | `/`             | List all notifications          |
| GET    | `/unreaded`     | List unread notifications       |
| GET    | `/unread-count` | Get the unread count            |
| PATCH  | `/read-all`     | Mark all as read                |
| PATCH  | `/:id/read`     | Mark one as read                |
| DELETE | `/:id`          | Delete a notification           |

## Real-time (Socket.IO)

> **Note:** For full, comprehensive documentation of all Socket.IO payloads and events, see [`SOCKET_EVENTS_DOCS.md`](./SOCKET_EVENTS_DOCS.md).

Connect to the same host and port as the API. The access token is passed in the **`auth` object** in the handshake:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: `Bearer ${accessToken}` },
});
```

Each connected user joins a private room named `user-<user_id>`.

**Client → Server**

| Event               | Payload                                                                          | Description                    |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| `typing`            | `{ conversation_id, conversation_type, is_typing }`                              | Typing indicator               |
| `message-delivered` | `{ conversation_id, conversation_type }`                                         | Mark messages as delivered     |
| `message-seen`      | `{ conversation_id, conversation_type }`                                         | Mark messages as seen          |

`conversation_type` is either `"direct"` or `"group"`. For a direct chat with no existing conversation, the conversation is created automatically on the first message.

**Server → Client**

| Event            | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `new-message`    | A new message arrived in one of your conversations             |
| `message-status` | Acknowledgement of a sent message, or delivered / seen updates |
| `message-edit`   | A message was edited                                            |
| `message-delete` | A message was deleted                                           |
| `typing`         | Another participant is typing                                   |
| `notification`   | A new notification (`follow`, `follow_request`, `like`, `comment`) |
| `online-users`   | List of followed users currently online (sent on connect)       |
| `online-user`    | A followed user went online or offline                          |
| `error-message`  | An error occurred while sending a message                       |

## File Uploads

Files are handled with Multer and stored in `src/uploads/` under a random filename. They are served statically at:

```
GET /api/uploads/<filename>
```

| Field name      | Used for                   | Restrictions                        |
| --------------- | -------------------------- | ----------------------------------- |
| `avatar`        | Profile avatar             | Images only (`jpg`, `jpeg`, `png`, `webp`) |
| `image_comment` | Comment image              | Images only (`jpg`, `jpeg`, `png`, `webp`) |
| `post_files`    | Post attachments           | Multiple files                      |
| `file`          | Chat file message          | Single file                         |

## Testing

Tests are written with Jest and cover controllers, services, and utilities.

```bash
npm test
```

## Security

- **Helmet** sets secure HTTP headers.
- **CORS** is restricted to `CLIENT_URL` with credentials enabled.
- **Rate limiting** — 300 requests per 15 minutes per client.
- **Passwords** are hashed with bcrypt.
- **Refresh tokens** are stored in `httpOnly`, `secure` cookies.
- **Input validation** with Zod on request bodies.

---

## License

ISC
