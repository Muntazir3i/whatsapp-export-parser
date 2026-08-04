/**
 * @file index.js
 * @description Composition Root for the WhatsApp Export Parser application.
 * Instantiates components and orchestrates the ETL pipeline (Extract, Transform, Load)
 */

import { createDatabaseConnection } from "./db/database.js";
import { createSchema, ChatRepository } from "./db/schema.js";
import { extractChatMetadata, streamChatMessages, ConsoleProgressReporter } from "./parser/importer.js";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { extractChatFileInfo } from "./parser/importer.js";
import { extractZip, findChatFile } from "./services/importChat.js";
import path from "path";



const rl = readline.createInterface({
    input,
    output
});

const zipPath = await rl.question("Enter ZIP file path: ");

rl.close();

const [fileName, contact] = extractChatFileInfo(zipPath);


const importDir = path.join("./src/data/imports", contact);

//extract zip

await extractZip(zipPath, importDir);

// Locate the exported chat file

const chatFilePath = await findChatFile(importDir);


// Configuration constants
const EXPORT_FILE_PATH = chatFilePath;
const BATCH_SIZE = 1000;

async function main() {
    // 1. Initialize SQLite Database Connection & Schema
    const db = createDatabaseConnection("chats.db");
    createSchema(db);

    // 2. Initialize Data Repository & Console UI Progress Reporter
    const repository = new ChatRepository(db);
    const progressReporter = new ConsoleProgressReporter();

    // 3. Register Chat Session Metadata
    const chatMetadata = extractChatMetadata(EXPORT_FILE_PATH);
    const chatRecord = repository.createChat(chatMetadata);
    const chatId = chatRecord.id;

    // 4. Stream and Batch Message Insertions
    let messageBuffer = [];

    await streamChatMessages(
        EXPORT_FILE_PATH,
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

    // 5. Flush Remaining Buffer Tail & Complete
    if (messageBuffer.length > 0) {
        repository.insertBatch(messageBuffer);
    }

    progressReporter.complete();
}

main().catch((err) => {
    console.error("Pipeline execution failed:", err);
    process.exit(1);
});
