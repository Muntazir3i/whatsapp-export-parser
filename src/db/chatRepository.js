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


export class chatRepository {
    constructor(db) {
        this.db = db;
    }

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

    deleteMessageById(chat_id) {
    const messages = this.db.prepare('DELETE FROM messages WHERE chat_id = ?').run(chat_id);
    const chat = this.db.prepare('DELETE FROM chats WHERE id = ?').run(chat_id)
    return {messages: messages.changes, chat: chat.changes}
}

}