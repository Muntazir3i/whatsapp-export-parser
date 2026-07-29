/**
 * @file index.js
 * @description Main entry point for the WhatsApp export parser application.
 * Executes the ETL pipeline: creates DB schema, reads export file, streams & parses messages,
 * and performs batched transaction insertions into SQLite for maximum throughput.
 */

import { createSchema, addToChat, addToMessages } from "./db/schema.js";
import { importChat, importMessage } from "./parser/importer.js";
import db from "./db/database.js";

// Target WhatsApp chat export text file location
const location = "/home/mdot/projectFolder/whatsapp-export-parser/WhatsApp Chat with Ana.txt";

// 1. Ensure SQLite database tables (`chats` and `messages`) exist
createSchema();

// 2. Register chat metadata record in the database and retrieve generated `chat_id`
const chat = addToChat(importChat(location));
const chat_id = chat.id;

// 3. Configure batching constants and buffer array for efficient bulk database insertion
const BATCH_SIZE = 1000;
let buffer = [];

/**
 * Pre-compiled SQLite transaction wrapper to execute bulk message inserts inside a single database transaction.
 */
const insertBatch = db.transaction((messages) => {
    for (const msg of messages) {
        addToMessages(msg);
    }
});

// 4. Stream and parse messages line-by-line from the export file
await importMessage(location, async (msg) => {
    buffer.push({
        chat_id,
        ...msg
    });

    // When buffer reaches batch size limit, write batch to database within transaction and reset buffer
    if (buffer.length >= BATCH_SIZE) {
        insertBatch(buffer);
        buffer = [];
    }
});

// 5. Flush and insert any remaining residual messages in the buffer after file reading completes
if (buffer.length > 0) {
    insertBatch(buffer);
}
