/**
 * @file index.js
 * @description Composition Root for the WhatsApp Export Parser application.
 * Instantiates components and orchestrates the ETL pipeline (Extract, Transform, Load).
 */

import { createDatabaseConnection } from "./db/database.js";
import { createSchema, ChatRepository } from "./db/schema.js";
import { extractChatMetadata, streamChatMessages, ConsoleProgressReporter } from "./parser/importer.js";
import { grabFileLocation, extractZip, findChatFile } from "./services/importChat.js";

const BATCH_SIZE = 1000;

async function main() {
    // 1. Initialize Console UI Progress Reporter
    const progressReporter = new ConsoleProgressReporter();

    // 2. Resolve Export File Location (ZIP or TXT)
    const { filePath, importDir, isZip } = await grabFileLocation();
    let chatFilePath = filePath;

    if (isZip) {
        progressReporter.updateZip(0, 1);
        await extractZip(filePath, importDir, (current, total) => {
            progressReporter.updateZip(current, total);
        });
        progressReporter.completeZip();
        chatFilePath = await findChatFile(importDir);
    }

    // 3. Initialize SQLite Database Connection & Schema
    const db = createDatabaseConnection("chats.db");
    createSchema(db);

    // 4. Initialize Data Repository
    const repository = new ChatRepository(db);

    // 5. Register Chat Session Metadata
    const chatMetadata = extractChatMetadata(chatFilePath);
    const chatRecord = repository.createChat(chatMetadata);
    const chatId = chatRecord.id;

    // 6. Stream and Batch Message Insertions
    let messageBuffer = [];

    await streamChatMessages(
        chatFilePath,
        async (parsedMessage) => {
            messageBuffer.push({
                chat_id: chatId,
                ...parsedMessage
            });

            if (messageBuffer.length >= BATCH_SIZE) {
                repository.insertBatch(messageBuffer);
                messageBuffer = [];
            }
        },
        (bytesRead, totalBytes) => {
            progressReporter.update(bytesRead, totalBytes);
        }
    );

    // 7. Flush Remaining Buffer Tail & Complete
    if (messageBuffer.length > 0) {
        repository.insertBatch(messageBuffer);
    }

    progressReporter.complete();
}

main().catch((err) => {
    console.error("\n❌ Pipeline execution failed:", err.message || err);
    process.exit(1);
});
