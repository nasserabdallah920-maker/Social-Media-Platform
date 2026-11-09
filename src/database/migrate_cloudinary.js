require("dotenv").config();
const db = require("../config/db.config");

async function migrate() {
  try {
    console.log("Starting migration for Cloudinary support...");

    // 1. Profiles: drop unique index on avatar and increase size
    try {
      const [indexes] = await db.query("SHOW INDEX FROM profiles WHERE Key_name = 'avatar'");
      if (indexes.length > 0) {
        await db.query("ALTER TABLE profiles DROP INDEX avatar");
        console.log("Dropped unique index avatar on profiles");
      }
    } catch (e) {
      console.log("Index error:", e.message);
    }

    await db.query("ALTER TABLE profiles MODIFY avatar VARCHAR(1000) DEFAULT NULL");
    console.log("Modified profiles.avatar to VARCHAR(1000)");

    // Helper to add column if not exists
    async function addCol(table, col, def) {
      const [cols] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
      if (cols.length === 0) {
        await db.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
        console.log(`Added ${col} to ${table}`);
      } else {
        console.log(`${col} already exists in ${table}`);
      }
    }

    // 2. post_images
    await db.query("ALTER TABLE post_images MODIFY image_url VARCHAR(1000) NOT NULL");
    await addCol("post_images", "media_type", "VARCHAR(50) DEFAULT 'image'");
    await addCol("post_images", "public_id", "VARCHAR(255) DEFAULT NULL");
    await addCol("post_images", "file_name", "VARCHAR(255) DEFAULT NULL");
    await addCol("post_images", "file_size", "BIGINT UNSIGNED DEFAULT NULL");

    // 3. comment_images
    await db.query("ALTER TABLE comment_images MODIFY image_url VARCHAR(1000) NOT NULL");
    await addCol("comment_images", "media_type", "VARCHAR(50) DEFAULT 'image'");
    await addCol("comment_images", "public_id", "VARCHAR(255) DEFAULT NULL");
    await addCol("comment_images", "file_name", "VARCHAR(255) DEFAULT NULL");
    await addCol("comment_images", "file_size", "BIGINT UNSIGNED DEFAULT NULL");

    // 4. messages
    await db.query("ALTER TABLE messages MODIFY file_url VARCHAR(1000) DEFAULT NULL");
    await addCol("messages", "media_type", "VARCHAR(50) DEFAULT NULL");
    await addCol("messages", "public_id", "VARCHAR(255) DEFAULT NULL");
    await addCol("messages", "file_name", "VARCHAR(255) DEFAULT NULL");
    await addCol("messages", "file_size", "BIGINT UNSIGNED DEFAULT NULL");

    console.log("Database migration for Cloudinary completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();

