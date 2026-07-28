import db from "./database.js";

export function createSchema() {
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
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
        );

        `
    );

    console.log("Database schema ready.");
}


export function addToChat() {
    const insertChat = db.prepare(`
    INSERT INTO chats (name, file_name)
    VALUES (@name, @file_name)
    RETURNING *
`);

const newRow = insertChat.get({
        name: "MOhammad",
        file_name: "Mohammad.txt"
    });

    console.log("Database Insertion Result:", newRow);


}