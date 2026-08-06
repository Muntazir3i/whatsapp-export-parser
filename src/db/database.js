/**
 * @file database.js
 * @description Factory for initializing SQLite database connections using better-sqlite3.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Creates and opens a new SQLite database connection.
 * 
 * @param {string} [dbName="chats.db"] - Path to the SQLite database file.
 * @returns {Database.Database} SQLite database instance.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function createDatabaseConnection(dbName = "chats.db") {
    console.log(`Opening database connection: ${dbName}...`);
    const dbPath = path.join(__dirname, "../../chats.db");
    const db = new Database(dbPath);
    console.log("Database connected successfully.");
    return db;
}