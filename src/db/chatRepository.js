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
        return this.db.prepare(`SELECT * FROM chats`).all()
    }

    findChatById(chatId) {
        return this.db.prepare('SELECT id, name FROM chats WHERE id = ?').get(chatId);
    }
}