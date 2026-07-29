import { createSchema, addToChat, addToMessages } from "./db/schema.js";
import { importChat, importMessage } from "./parser/importer.js";
import db from "./db/database.js";

createSchema();

const location = "";

const chat = addToChat(importChat(location));
const chat_id = chat.id;

const BATCH_SIZE = 1000;
let buffer = [];

// One transaction for a batch
const insertBatch = db.transaction((messages) => {
    for (const msg of messages) {
        addToMessages(msg);
    }
});

await importMessage(location, async (msg) => {
    buffer.push({
        chat_id,
        ...msg
    });

    // When the batch is full, write it to SQLite
    if (buffer.length >= BATCH_SIZE) {
        insertBatch(buffer);
        buffer = [];
    }
});

// Insert any remaining messages
if (buffer.length > 0) {
    insertBatch(buffer);
}
