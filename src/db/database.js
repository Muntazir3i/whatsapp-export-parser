/**
 * @file database.js
 * @description Factory for initializing SQLite database connections using better-sqlite3.
 */

import Database from "better-sqlite3";

/**
 * Creates and opens a new SQLite database connection.
 * 
 * @param {string} [dbPath="chats.db"] - Path to the SQLite database file.
 * @returns {Database.Database} SQLite database instance.
 */
export function createDatabaseConnection(dbPath = "chats.db") {
    console.log(`Opening database connection: ${dbPath}...`);
    const db = new Database(dbPath);
    console.log("Database connected successfully.");
    return db;
}