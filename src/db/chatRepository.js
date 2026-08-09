/**
 * @file chatRepository.js
 * @description
 * Encapsulates all database operations related to chats and messages.
 *
 * This repository is responsible only for interacting with the SQLite
 * database using SQL queries. It provides methods for creating chats,
 * inserting messages, retrieving chat and message data, searching,
 * and deleting records. It contains no application, business, or UI logic.
 */

/**
 * Repository class for executing database queries on the `chats` and `messages` tables.
 */
export class chatRepository {
    /**
     * Creates an instance of chatRepository.
     * 
     * @param {import('better-sqlite3').Database} db - An active better-sqlite3 database connection object.
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Retrieves all chats from the database along with their most recent message details.
     * 
     * Uses a LEFT JOIN with a correlated subquery to get the latest message text
     * and timestamp for each chat record.
     *
     * @returns {Array<Object>} An array of objects representing all chats (id, name, lastMessage, timestamp).
     */
    findAllChats() {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                m.message AS lastMessage, 
                m.timestamp 
            FROM chats c
            LEFT JOIN messages m 
                ON m.id = (
                    SELECT id 
                    FROM messages 
                    WHERE chat_id = c.id 
                    ORDER BY id DESC 
                    LIMIT 1
                )
        `;
        return this.db.prepare(query).all();
    }

    /**
     * Retrieves a single chat record by its unique ID along with its latest message.
     *
     * @param {number|string} id - The unique identifier of the chat to find.
     * @returns {Object|undefined} The chat record matching the ID, or `undefined` if not found.
     */
    findChatById(id) {
        const query = `
        SELECT 
            c.id, 
            c.name, 
            m.message AS lastMessage, 
            m.timestamp 
        FROM chats c
        LEFT JOIN messages m 
            ON m.id = (
                SELECT id 
                FROM messages 
                WHERE chat_id = c.id 
                ORDER BY id DESC 
                LIMIT 1
            )
        WHERE c.id = ?
    `;
        return this.db.prepare(query).get(id);
    }

    /**
     * Retrieves the latest 10 messages for a specified chat ID.
     *
     * @param {number|string} chat_id - The ID of the chat whose messages are being requested.
     * @returns {Array<Object>} An array containing up to 10 of the most recent message records for the chat.
     */
    findMessagesByChatId(chat_id) {
        const query = `
        SELECT * FROM (
            SELECT * FROM messages 
            WHERE chat_id = ? 
            ORDER BY id DESC 
            LIMIT 10
        )`;
        return this.db.prepare(query).all(chat_id);
    }

    /**
     * Deletes a chat record and all of its associated messages by chat ID.
     * 
     * Performs cascading deletion manually: deletes rows from the `messages` table first, 
     * then deletes the row from the `chats` table.
     *
     * @param {number|string} chat_id - The ID of the chat to delete.
     * @returns {{ messages: number, chat: number }} Object containing the count of affected rows for messages and chat.
     */
    deleteMessageById(chat_id) {
        // Delete all messages belonging to this chat ID
        const messages = this.db.prepare('DELETE FROM messages WHERE chat_id = ?').run(chat_id);
        // Delete the chat record itself
        const chat = this.db.prepare('DELETE FROM chats WHERE id = ?').run(chat_id);

        return { messages: messages.changes, chat: chat.changes };
    }
}