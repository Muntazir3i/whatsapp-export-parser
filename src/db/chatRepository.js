/**
 * @file chatRepository.js
 * @description
 * Encapsulates all database operations related to chats and messages.
 *
 * This repository is responsible for interacting with the SQLite database
 * using pre-compiled prepared statements and transactions. It provides methods
 * for retrieving chat and message data and performing atomic deletions.
 */

/**
 * Repository class for executing database queries on the `chats` and `messages` tables.
 */
export class chatRepository {
    /**
     * Creates an instance of chatRepository and pre-compiles SQL prepared statements.
     * 
     * @param {import('better-sqlite3').Database} db - An active better-sqlite3 database connection object.
     */
    constructor(db) {
        this.db = db;

        // Pre-compile statements once for optimal performance
        this.findAllChatsStmt = this.db.prepare(`
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
        `);

        this.findChatByIdStmt = this.db.prepare(`
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
        `);

        this.findInitialMessagesStmt = this.db.prepare(`
            SELECT * FROM messages 
            WHERE chat_id = ? 
            ORDER BY id DESC 
            LIMIT ?
        `);

        this.findOlderMessagesStmt = this.db.prepare(`
            SELECT * FROM messages 
            WHERE chat_id = ? AND id < ? 
            ORDER BY id DESC 
            LIMIT ?
        `);

        this.findNewerMessagesStmt = this.db.prepare(`
            SELECT * FROM (
                SELECT * FROM messages 
                WHERE chat_id = ? AND id > ? 
                ORDER BY id ASC 
                LIMIT ?
            ) ORDER BY id DESC
        `);

        // Pre-compile statement for deleting a chat (cascading deletes associated messages)
        this.deleteChatStmt = this.db.prepare('DELETE FROM chats WHERE id = ?');
    }

    /**
     * Retrieves all chats from the database along with their most recent message details.
     *
     * @returns {Array<Object>} An array of objects representing all chats (id, name, lastMessage, timestamp).
     */
    findAllChats() {
        return this.findAllChatsStmt.all();
    }

    /**
     * Retrieves a single chat record by its unique ID along with its latest message.
     *
     * @param {number|string} id - The unique identifier of the chat to find.
     * @returns {Object|undefined} The chat record matching the ID, or `undefined` if not found.
     */
    findChatById(id) {
        return this.findChatByIdStmt.get(id);
    }

    /**
     * Retrieves messages for a specified chat ID using cursor-based (keyset) pagination.
     *
     * @param {number|string} chat_id - The ID of the chat whose messages are requested.
     * @param {Object|number} [options] - Pagination options or numeric limit for backward compatibility.
     * @param {number} [options.limit=10] - Number of records to fetch.
     * @param {number} [options.beforeId] - Fetch messages before this message ID (older messages).
     * @param {number} [options.afterId] - Fetch messages after this message ID (newer messages).
     * @returns {{ messages: Array<Object>, hasMore: boolean }} Paginated messages array and paging metadata.
     */
    findMessagesByChatId(chat_id, options = {}) {
        let limit = 10;
        let beforeId = null;
        let afterId = null;

        if (typeof options === "number") {
            limit = options;
        } else if (options && typeof options === "object") {
            if (options.limit !== undefined) limit = options.limit;
            if (options.beforeId !== undefined) beforeId = options.beforeId;
            if (options.afterId !== undefined) afterId = options.afterId;
        }

        // Fetch limit + 1 to efficiently check if additional pages exist without COUNT(*)
        const fetchLimit = limit + 1;
        let rows = [];

        if (beforeId !== null) {
            rows = this.findOlderMessagesStmt.all(chat_id, beforeId, fetchLimit);
        } else if (afterId !== null) {
            rows = this.findNewerMessagesStmt.all(chat_id, afterId, fetchLimit);
        } else {
            rows = this.findInitialMessagesStmt.all(chat_id, fetchLimit);
        }

        const hasMore = rows.length > limit;
        if (hasMore) {
            rows.pop();
        }

        return {
            messages: rows,
            hasMore
        };
    }

    /**
     * Deletes a chat record from the database by ID.
     * 
     * Foreign key `ON DELETE CASCADE` automatically deletes all associated messages.
     *
     * @param {number|string} chat_id - The ID of the chat to delete.
     * @returns {{ chat: number }} Object containing the count of affected deleted chat records.
     */
    deleteChat(chat_id) {
        const result = this.deleteChatStmt.run(chat_id);
        return { chat: result.changes };
    }

    /**
     * Alias for `deleteChat` to maintain backward compatibility.
     *
     * @param {number|string} chat_id - The ID of the chat to delete.
     * @returns {{ chat: number }} Object containing the count of affected deleted chat records.
     */
    deleteMessageById(chat_id) {
        return this.deleteChat(chat_id);
    }
}