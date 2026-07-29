/**
 * @file index.js
 * @description Main entry point for the WhatsApp export parser application.
 * Executes the ETL pipeline: creates DB schema, reads export file, streams & parses messages,
 * and performs batched transaction insertions into SQLite for maximum throughput.
 */

import { createSchema, insertChatMetadata, insertMessage } from "./db/schema.js";
import { extractChatMetadata, streamChatMessages } from "./parser/importer.js";
import db from "./db/database.js";

// Target WhatsApp chat export text file path
const exportFilePath = "/home/mdot/projectFolder/whatsapp-export-parser/WhatsApp Chat with Ana.txt";

// 1. Ensure SQLite database tables (`chats` and `messages`) exist
createSchema();

// 2. Register chat metadata record in database and retrieve generated `chatId`
const chatRecord = insertChatMetadata(extractChatMetadata(exportFilePath));
const chatId = chatRecord.id;

// 3. Configure batching size and buffer array for efficient bulk database insertion
const BATCH_SIZE = 1000;
let messageBuffer = [];

/**
 * Pre-compiled SQLite transaction wrapper to execute bulk message inserts inside a single database transaction.
 */
const insertBatchTransaction = db.transaction((messages) => {
    for (const messageData of messages) {
        insertMessage(messageData);
    }
});

// 4. Stream and parse messages line-by-line from the export file
await streamChatMessages(exportFilePath, async (parsedMessage) => {
    messageBuffer.push({
        chat_id: chatId,
        ...parsedMessage
    });

    // When buffer reaches batch size limit, write batch to database within transaction and reset buffer
    if (messageBuffer.length >= BATCH_SIZE) {
        insertBatchTransaction(messageBuffer);
        messageBuffer = [];
    }
});

// 5. Flush and insert any remaining residual messages in the buffer after file reading completes
if (messageBuffer.length > 0) {
    insertBatchTransaction(messageBuffer);
}
