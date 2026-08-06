/**
 * @file database.js
 * @description
 * Creates and manages the application's SQLite database connection.
 *
 * This module exposes a single factory function that returns a configured
 * `better-sqlite3` database instance. The database file is always resolved
 * relative to the project root, ensuring the same database is used regardless
 * of the current working directory or where the application is executed from.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Resolve the absolute path of the current module.
 *
 * ES Modules do not provide `__filename` or `__dirname` like CommonJS,
 * so they are recreated using `import.meta.url`.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates and opens a SQLite database connection.
 *
 * The database path is resolved to the project root to avoid creating
 * duplicate database files when the application is executed from
 * different directories.
 *
 * @param {string} [dbName="chats.db"] - Name of the SQLite database file.
 * @returns {Database.Database} An active `better-sqlite3` database instance.
 */
export function createDatabaseConnection(dbName = "chats.db") {
    console.log(`Opening database connection: ${dbName}...`);

    // Absolute path to the database file in the project root.
    const dbPath = path.join(__dirname, "../../", dbName);

    const db = new Database(dbPath);

    console.log("Database connected successfully.");

    return db;
}