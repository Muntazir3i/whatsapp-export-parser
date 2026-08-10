/**
 * @file index.js
 * @description Composition Root for the WhatsApp Export Parser application.
 * Connects database, schema, repository, and services, then launches the interactive CLI app.
 */

import { createDatabaseConnection } from "./db/database.js";
import { createSchema, ChatRepository } from "./db/schema.js";
import { chatRepository } from "./db/chatRepository.js";
import { chatServices } from "./services/chatService.js";
import { CLIApp } from "./cli/cliApp.js";

async function main() {
    // 1. Initialize Database Connection & Schema
    const db = createDatabaseConnection("chats.db");
    createSchema(db);

    // 2. Instantiate Repositories & Services
    const repository = new ChatRepository(db);
    const readRepository = new chatRepository(db);
    const chatService = new chatServices(readRepository);

    // 3. Launch Interactive CLI Application
    const cliApp = new CLIApp(chatService, repository);
    await cliApp.start();
}

main().catch((err) => {
    console.error("\n❌ Application execution failed:", err.message || err);
    process.exit(1);
});
