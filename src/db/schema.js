/**
 * @file schema.js
 * @description Manages SQLite table creation schemas and helper functions for database insertions.
 */

import db from "./database.js";

/**
 * Creates the required tables (`chats` and `messages`) in the database if they do not already exist.
 */
export function createSchema() {
    console.log("Checking database schema...");

    // Execute schema DDL queries
    db.exec(
        `
        CREATE TABLE IF NOT EXISTS chats(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_name TEXT,
            imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        );
        `
    );

    console.log("Database schema ready.");
}

/**
 * Inserts a new chat record into the `chats` table.
 * 
 * @param {Object} chatData - Object containing chat metadata.
 * @param {string} chatData.name - The extracted contact/chat name.
 * @param {string} chatData.file_name - The file name of the exported chat file.
 * @returns {Object} The inserted chat database row object including generated `id`.
 */
export function insertChatMetadata(chatData) {
    const insertChatStmt = db.prepare(`
        INSERT INTO chats (name, file_name)
        VALUES (@name, @file_name)
        RETURNING *
    `);

    const insertedRow = insertChatStmt.get({
        name: chatData.name,
        file_name: chatData.file_name
    });

    console.log("Database Insertion Result:", insertedRow);
    return insertedRow;
}

/**
 * Inserts a single message record into the `messages` table.
 * 
 * @param {Object} messageData - Object containing message data.
 * @param {number} messageData.chat_id - Foreign key reference to the associated chat.
 * @param {string} messageData.sender - Name or phone number of the message sender.
 * @param {string} messageData.message - Text content of the message.
 * @param {string} messageData.timestamp - Formatted timestamp string of the message.
 */
export function insertMessage(messageData) {
    const insertMessageStmt = db.prepare(`
        INSERT INTO messages (chat_id, sender, message, timestamp)
        VALUES (@chat_id, @sender, @message, @timestamp)
        RETURNING *
    `);

    insertMessageStmt.run({
        chat_id: messageData.chat_id,
        sender: messageData.sender,
        message: messageData.message,
        timestamp: messageData.timestamp
    });
}