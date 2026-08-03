/**
 * @file schema.js
 * @description Defines database schema DDL and provides a ChatRepository class for data access and transactional batch insertions.
 */

/**
 * Creates the required tables (`chats` and `messages`) in the database if they do not already exist.
 *
 * @param {import("better-sqlite3").Database} db - SQLite database instance.
 */
export function createSchema(db) {
    console.log("Checking database schema...");

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
            sender TEXT,
            message TEXT,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        );
        `
    );

    console.log("Database schema ready.");
}

/**
 * Repository encapsulating database operations for chats and messages.
 */
export class ChatRepository {
    /**
     * Constructs a ChatRepository instance and prepares SQL statements.
     * 
     * @param {import("better-sqlite3").Database} db - Active SQLite database instance.
     */
    constructor(db) {
        this.db = db;

        // Pre-compile SQL insert statements for optimal performance
        this.insertChatStmt = this.db.prepare(`
            INSERT INTO chats (name, file_name)
            VALUES (@name, @file_name)
            RETURNING *
        `);

        this.insertMessageStmt = this.db.prepare(`
            INSERT INTO messages (chat_id, sender, message, timestamp)
            VALUES (@chat_id, @sender, @message, @timestamp)
        `);

        // Pre-compile bulk batch insert transaction wrapper
        this.batchTransaction = this.db.transaction((messages) => {
            for (const msg of messages) {
                this.insertMessageStmt.run({
                    chat_id: msg.chat_id,
                    sender: msg.sender,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    type: msg.type
                });
            }
        });
    }

    /**
     * Inserts a new chat metadata record.
     * 
     * @param {Object} chatData - Chat metadata object containing `name` and `file_name`.
     * @returns {Object} The inserted database row object including `id`.
     */
    createChat(chatData) {
        const insertedRow = this.insertChatStmt.get({
            name: chatData.name,
            file_name: chatData.file_name
        });
        console.log("Chat Record Created:", insertedRow);
        return insertedRow;
    }

    /**
     * Inserts a single message record.
     * 
     * @param {Object} messageData - Message data object.
     */
    insertMessage(messageData) {
        this.insertMessageStmt.run({
            chat_id: messageData.chat_id,
            sender: messageData.sender,
            message: messageData.message,
            timestamp: messageData.timestamp
        });
    }

    /**
     * Inserts an array of messages within a single SQLite transaction.
     * 
     * @param {Array<Object>} messages - Array of message objects to insert in bulk.
     */
    insertBatch(messages) {
        this.batchTransaction(messages);
    }
}