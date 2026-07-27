import Database from "better-sqlite3";

console.log("Opening database...");

const db = new Database("chats.db");

console.log("Database connected.");

export default db;