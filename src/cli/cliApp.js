/**
 * @file cliApp.js
 * @description Interactive Command-Line Interface (CLI) Controller for managing WhatsApp chat imports, viewing chats/messages, and deletion.
 */

import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { grabFileLocation, extractZip, findChatFile } from "../services/importChat.js";
import { extractChatMetadata, streamChatMessages, ConsoleProgressReporter } from "../parser/importer.js";

/**
 * Interactive CLI Application Controller.
 */
export class CLIApp {
    /**
     * @param {import('../services/chatService.js').chatServices} chatService - Service for chat business operations.
     * @param {import('../db/schema.js').ChatRepository} repository - Data access repository for chat imports.
     */
    constructor(chatService, repository) {
        this.chatService = chatService;
        this.repository = repository;
    }

    /**
     * Runs the main interactive menu loop.
     */
    async start() {
        const rl = readline.createInterface({ input, output });
        let running = true;

        console.log("\n==========================================");
        console.log(" 📱 WhatsApp Export Parser & Chat Manager ");
        console.log("==========================================");

        while (running) {
            console.log("\nMenu Options:");
            console.log(" [1] 📥 Import New Chat (.zip or .txt)");
            console.log(" [2] 📋 View All Chats");
            console.log(" [3] 💬 View Messages for a Chat (by ID)");
            console.log(" [4] 🗑️  Delete a Chat (by ID)");
            console.log(" [5] 🚪 Exit");
            console.log("------------------------------------------");

            const choice = (await rl.question("Select an option (1-5): ")).trim();

            switch (choice) {
                case "1":
                    await this.handleImportChat(rl);
                    break;
                case "2":
                    await this.handleViewAllChats(rl);
                    break;
                case "3":
                    await this.handleViewMessages(rl);
                    break;
                case "4":
                    await this.handleDeleteChat(rl);
                    break;
                case "5":
                    console.log("\nGoodbye! 👋\n");
                    running = false;
                    break;
                default:
                    console.log("❌ Invalid option. Please enter a number between 1 and 5.");
            }
        }

        rl.close();
    }

    /**
     * Handles Menu Option 1: Importing a new chat (.zip or .txt)
     */
    async handleImportChat(rl) {
        console.log("\n--- 📥 Import New Chat ---");
        try {
            const rawPath = await rl.question("Enter WhatsApp export file path (.zip or .txt): ");
            const pathInput = rawPath.trim();

            if (!pathInput) {
                console.log("❌ Import cancelled: No file path provided.");
                return;
            }

            const { filePath, importDir, isZip } = await grabFileLocation(pathInput);
            let chatFilePath = filePath;

            const progressReporter = new ConsoleProgressReporter();

            if (isZip) {
                progressReporter.updateZip(0, 1);
                await extractZip(filePath, importDir, (current, total) => {
                    progressReporter.updateZip(current, total);
                });
                progressReporter.completeZip();
                chatFilePath = await findChatFile(importDir);
            }

            const chatMetadata = extractChatMetadata(chatFilePath);
            const chatRecord = this.repository.createChat(chatMetadata);
            const chatId = chatRecord.id;

            const BATCH_SIZE = 1000;
            let messageBuffer = [];

            await streamChatMessages(
                chatFilePath,
                async (parsedMessage) => {
                    messageBuffer.push({
                        chat_id: chatId,
                        ...parsedMessage
                    });

                    if (messageBuffer.length >= BATCH_SIZE) {
                        this.repository.insertBatch(messageBuffer);
                        messageBuffer = [];
                    }
                },
                (bytesRead, totalBytes) => {
                    progressReporter.update(bytesRead, totalBytes);
                }
            );

            if (messageBuffer.length > 0) {
                this.repository.insertBatch(messageBuffer);
            }

            progressReporter.complete();
        } catch (err) {
            console.error("\n❌ Import failed:", err.message || err);
        }
    }

    /**
     * Handles Menu Option 2: Viewing all imported chats
     */
    async handleViewAllChats(rl) {
        console.log("\n--- 📋 All Stored Chats ---");
        const chats = this.chatService.getChats();

        if (!chats || chats.length === 0) {
            console.log("No chats found in the database.");
        } else {
            console.table(
                chats.map((c) => ({
                    ID: c.id,
                    Name: c.name,
                    "Last Message": c.lastMessage ? (c.lastMessage.length > 40 ? c.lastMessage.slice(0, 37) + "..." : c.lastMessage) : "N/A",
                    Timestamp: c.timestamp || "N/A"
                }))
            );
        }

        await rl.question("\nPress Enter to return to main menu...");
    }

    /**
     * Handles Menu Option 3: Viewing messages for a specific chat ID with cursor-based pagination
     */
    async handleViewMessages(rl) {
        console.log("\n--- 💬 View Chat Messages ---");
        const idInput = await rl.question("Enter Chat ID: ");
        const chatId = Number(idInput.trim());

        if (!idInput.trim() || Number.isNaN(chatId)) {
            console.log("❌ Invalid Chat ID. Please enter a valid number.");
            return;
        }

        const chat = this.chatService.getChat(chatId);
        if (!chat) {
            console.log(`❌ Chat with ID ${chatId} does not exist.`);
            return;
        }

        let queryOptions = { limit: 10 };
        let paging = true;

        while (paging) {
            const { messages, hasMore } = this.chatService.getMessages(chatId, queryOptions);
            console.log(`\n💬 Messages for "${chat.name}" (ID: ${chatId}):`);
            console.log("--------------------------------------------------------------------------------");

            if (!messages || messages.length === 0) {
                console.log("No messages found for this view.");
            } else {
                // Reversing messages array to show them in chronological order
                const chronological = [...messages].reverse();
                for (const msg of chronological) {
                    const senderName = msg.sender ? msg.sender : "System";
                    console.log(`[${msg.timestamp}] ${senderName}: ${msg.message}`);
                }
            }
            console.log("--------------------------------------------------------------------------------");

            const minId = messages && messages.length > 0 ? messages[messages.length - 1].id : null;
            const maxId = messages && messages.length > 0 ? messages[0].id : null;

            const canGoNext = minId !== null && (hasMore || queryOptions.afterId !== undefined);
            const canGoPrev = maxId !== null && (queryOptions.beforeId !== undefined || queryOptions.afterId !== undefined);

            console.log("\nNavigation Options:");
            if (canGoNext) console.log(" [n] Next Page (Older messages)");
            if (canGoPrev) console.log(" [p] Previous Page (Newer messages)");
            console.log(" [e] Exit to main menu");

            const navChoice = (await rl.question("\nSelect option: ")).trim().toLowerCase();

            if (navChoice === "n" && canGoNext) {
                queryOptions = { limit: 10, beforeId: minId };
            } else if (navChoice === "p" && canGoPrev) {
                queryOptions = { limit: 10, afterId: maxId };
            } else if (navChoice === "e" || navChoice === "") {
                paging = false;
            } else {
                console.log("❌ Invalid option.");
            }
        }
    }

    /**
     * Handles Menu Option 4: Deleting a chat by ID
     */
    async handleDeleteChat(rl) {
        console.log("\n--- 🗑️ Delete Chat ---");
        const idInput = await rl.question("Enter Chat ID to delete: ");
        const chatId = Number(idInput.trim());

        if (!idInput.trim() || Number.isNaN(chatId)) {
            console.log("❌ Invalid Chat ID. Please enter a valid number.");
            return;
        }

        const chat = this.chatService.getChat(chatId);
        if (!chat) {
            console.log(`❌ Chat with ID ${chatId} does not exist.`);
            return;
        }

        const confirm = await rl.question(`Are you sure you want to delete "${chat.name}" (ID: ${chatId}) and all its messages? (y/N): `);

        if (confirm.trim().toLowerCase() === "y") {
            this.chatService.deleteChat(chatId);
            console.log(`✅ Chat "${chat.name}" (ID: ${chatId}) deleted successfully.`);
        } else {
            console.log("Operation cancelled.");
        }
    }
}
