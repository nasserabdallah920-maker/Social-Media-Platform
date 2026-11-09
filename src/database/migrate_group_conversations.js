require("dotenv").config();
const db = require("../config/db.config");

async function migrateGroupConversations() {
  try {
    console.log("Checking and updating database schema for group conversations...");

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

    // 1. Conversations table: name & avatar
    await addCol("conversations", "name", "VARCHAR(255) DEFAULT NULL");
    await addCol("conversations", "avatar", "VARCHAR(1000) DEFAULT NULL");

    // 2. Conversation_members table: role ('admin', 'member')
    await addCol("conversation_members", "role", "ENUM('admin', 'member') DEFAULT 'member'");

    console.log("Group conversation migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Group conversation migration failed:", err);
    process.exit(1);
  }
}

migrateGroupConversations();

