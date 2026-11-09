CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY username (user_name)
);

CREATE TABLE profiles (
  id INT NOT NULL AUTO_INCREMENT,
  avatar VARCHAR(1000) DEFAULT NULL,
  bio VARCHAR(255) DEFAULT NULL,
  user_id INT NOT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),

  KEY profiles_ibfk_1 (user_id),
  CONSTRAINT profiles_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE posts (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  text VARCHAR(3000) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT posts_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE post_images (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image',
  public_id VARCHAR(255) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  KEY post_id (post_id),
  CONSTRAINT post_images_ibfk_1
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE
);

CREATE TABLE follows (
  id INT NOT NULL AUTO_INCREMENT,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY follower_id (follower_id, following_id),
  KEY follows_following_fk (following_id),
  CONSTRAINT follows_follower_fk
    FOREIGN KEY (follower_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT follows_following_fk
    FOREIGN KEY (following_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE blocks (
  id INT NOT NULL AUTO_INCREMENT,
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY blocker_id (blocker_id, blocked_id),
  KEY blocks_blocked_fk (blocked_id),
  CONSTRAINT blocks_blocked_fk
    FOREIGN KEY (blocked_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT blocks_blocker_fk
    FOREIGN KEY (blocker_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE likes (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id, post_id),
  KEY post_id (post_id),
  CONSTRAINT likes_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT likes_ibfk_2
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE
);

CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  text VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY post_id (post_id),
  CONSTRAINT comments_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_2
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE
);

CREATE TABLE comment_replies (
  id INT NOT NULL AUTO_INCREMENT,
  comment_id INT NOT NULL,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  text VARCHAR(1200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY comment_id (comment_id),
  KEY from_user_id (from_user_id),
  KEY to_user_id (to_user_id),
  CONSTRAINT comment_replies_ibfk_1
    FOREIGN KEY (comment_id) REFERENCES comments (id)
    ON DELETE CASCADE,
  CONSTRAINT comment_replies_ibfk_2
    FOREIGN KEY (from_user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT comment_replies_ibfk_3
    FOREIGN KEY (to_user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE comment_images (
  id INT NOT NULL AUTO_INCREMENT,
  comment_id INT DEFAULT NULL,
  reply_comment_id INT DEFAULT NULL,
  image_url VARCHAR(1000) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image',
  public_id VARCHAR(255) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  KEY comment_id (comment_id),
  KEY reply_comment_id (reply_comment_id),
  CONSTRAINT comment_images_ibfk_1
    FOREIGN KEY (comment_id) REFERENCES comments (id)
    ON DELETE CASCADE,
  CONSTRAINT comment_images_ibfk_2
    FOREIGN KEY (reply_comment_id) REFERENCES comment_replies (id)
    ON DELETE CASCADE,
  CONSTRAINT comment_images_chk_1 CHECK (
    (comment_id IS NOT NULL AND reply_comment_id IS NULL)
    OR
    (comment_id IS NULL AND reply_comment_id IS NOT NULL)
  )
);

CREATE TABLE conversations (
  id INT NOT NULL AUTO_INCREMENT,
  type ENUM('direct','group') DEFAULT 'direct',
  name VARCHAR(255) DEFAULT NULL,
  avatar VARCHAR(1000) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE conversation_members (
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin','member') DEFAULT 'member',
  PRIMARY KEY (conversation_id, user_id),
  KEY user_id (user_id),
  CONSTRAINT conversation_members_ibfk_1
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    ON DELETE CASCADE,
  CONSTRAINT conversation_members_ibfk_2
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT NOT NULL AUTO_INCREMENT,
  sender_id INT NOT NULL,
  text VARCHAR(4000) DEFAULT NULL,
  conversation_id INT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent','delivered','seen') DEFAULT 'sent',
  file_url VARCHAR(1000) DEFAULT NULL,
  media_type VARCHAR(50) DEFAULT NULL,
  public_id VARCHAR(255) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  KEY senderId (sender_id),
  KEY conversationId (conversation_id),
  CONSTRAINT messages_ibfk_1
    FOREIGN KEY (sender_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT messages_ibfk_2
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  actor_id INT DEFAULT NULL,
  type ENUM(
    'follow',
    'like',
    'comment',
    'reply',
    'follow_request',
    'follow_accept'
  ) DEFAULT NULL,
  post_id INT DEFAULT NULL,
  comment_id INT DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY actor_id (actor_id),
  KEY post_id (post_id),
  KEY comment_id (comment_id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT notifications_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT notifications_ibfk_2
    FOREIGN KEY (actor_id) REFERENCES users (id)
    ON DELETE SET NULL,
  CONSTRAINT notifications_ibfk_3
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE,
  CONSTRAINT notifications_ibfk_4
    FOREIGN KEY (comment_id) REFERENCES comments (id)
    ON DELETE CASCADE
);

CREATE TABLE requests (
  id INT NOT NULL AUTO_INCREMENT,
  from_user_id INT DEFAULT NULL,
  to_user_id INT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY from_user_id (from_user_id, to_user_id),
  KEY requests_ibfk_2 (to_user_id),
  CONSTRAINT requests_ibfk_1
    FOREIGN KEY (from_user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT requests_ibfk_2
    FOREIGN KEY (to_user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY token_hash (token_hash),
  KEY user_id (user_id),
  CONSTRAINT password_reset_tokens_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);
