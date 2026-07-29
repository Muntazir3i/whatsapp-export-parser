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


export function addToChat(chatObj) {
    const insertChat = db.prepare(`
    INSERT INTO chats (name, file_name)
    VALUES (@name, @file_name)
    RETURNING *
`);

    const newRow = insertChat.get({
        name: chatObj.name,
        file_name: chatObj.file_name
    });

    console.log("Database Insertion Result:", newRow);
    return newRow;


}



export function addToMessages(msgObj) {

    const insertChat = db.prepare(`
    INSERT INTO messages (chat_id, sender, message, timestamp)
    VALUES (@chat_id, @sender, @message, @timestamp)
    RETURNING *
`);


    insertChat.run({
        chat_id: msgObj.chat_id,
        sender: msgObj.sender,
        message: msgObj.message,
        timestamp: msgObj.timestamp
    });

    // console.log("Database Insertion Result:", newRow);



}