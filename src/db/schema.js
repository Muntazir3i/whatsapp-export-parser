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
 * @param {Object} chatObj - Object containing chat metadata.
 * @param {string} chatObj.name - The extracted contact/chat name.
 * @param {string} chatObj.file_name - The file name of the exported chat file.
 * @returns {Object} The inserted chat database row object including generated `id`.
 */
export function addToChat(chatObj) {
    const insertChat = db.prepare(`
        INSERT INTO chats (name, file_name)
        VALUES (@name, @file_name)
        RETURNING *
    `);

    const newRow = insertChat.get({
        name: chatObj.name,
        file_name: chatObj.file_name
    });

    console.log("Database Insertion Result:", newRow);
    return newRow;
}

/**
 * Inserts a single message record into the `messages` table.
 * 
 * @param {Object} msgObj - Object containing message data.
 * @param {number} msgObj.chat_id - Foreign key reference to the associated chat.
 * @param {string} msgObj.sender - Name or phone number of the message sender.
 * @param {string} msgObj.message - Text content of the message.
 * @param {string} msgObj.timestamp - Formatted timestamp string of the message.
 */
export function addToMessages(msgObj) {
    const insertMsg = db.prepare(`
        INSERT INTO messages (chat_id, sender, message, timestamp)
        VALUES (@chat_id, @sender, @message, @timestamp)
        RETURNING *
    `);

    insertMsg.run({
        chat_id: msgObj.chat_id,
        sender: msgObj.sender,
        message: msgObj.message,
        timestamp: msgObj.timestamp
    });
}