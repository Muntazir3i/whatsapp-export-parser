/**
 * @file database.js
 * @description Initializes and manages the SQLite database connection using better-sqlite3.
 */

import Database from "better-sqlite3";

console.log("Opening database...");

// Initialize SQLite database instance stored in chats.db
const db = new Database("chats.db");

console.log("Database connected.");

export default db;