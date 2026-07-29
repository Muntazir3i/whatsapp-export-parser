/**
 * @file importer.js
 * @description High-level stream importer for reading WhatsApp export files, tracking import progress, and invoking callbacks for parsed messages.
 */

import { createLineReader } from "./reader.js";
import { parseMessageLine, parseMessageText } from "./messageParser.js";
import fs from "fs";

/**
 * Extracts the relative file name and contact name from the file path.
 *
 * @param {string} filePath - Target chat export file path string.
 * @returns {[string, string]} Array containing `[fileName, contactName]`.
 */
function extractChatFileInfo(filePath) {
    let withPrefixIndex = filePath.indexOf("with") + 5;

    let fileName = filePath.slice(withPrefixIndex);
    let dotExtensionIndex = fileName.indexOf(".");
    let contactName = fileName.slice(0, dotExtensionIndex);

    return [fileName, contactName];
}

/**
 * Prepares chat metadata (chat name and file name) from a target export path.
 *
 * @param {string} filePath - Path to the chat export file.
 * @returns {{ name: string, file_name: string }} Chat metadata object.
 */
export function extractChatMetadata(filePath) {
    let [fileName, contactName] = extractChatFileInfo(filePath);
    return { name: contactName, file_name: fileName };
}

/**
 * Streams messages line-by-line from a text file, displaying a CLI progress bar, and invoking a callback for each parsed message.
 *
 * @param {string} filePath - Path to the WhatsApp export `.txt` file.
 * @param {Function} onMessageParsed - Async callback function `(messageObj) => Promise<void>` invoked when a message object is ready.
 */
export async function streamChatMessages(filePath, onMessageParsed) {
    // Obtain readline interface for streaming file read
    const lineReader = createLineReader(filePath);

    // Compute total file size in bytes for progress calculation
    const totalBytes = fs.statSync(filePath).size;
    let bytesRead = 0;
    const progressBarWidth = 30; // Terminal progress bar character width

    // Mutable state container to hold partially built multi-line messages
    const state = { accumulatedMessageBuffer: "" };

    // Track last rendered percentage to throttle stdout writes and avoid log buffer inflation
    let lastRenderedPercent = "";

    for await (const line of lineReader) {
        if (line.length === 0) continue;

        // Update byte count (line byte length + 1 byte for newline separator)
        bytesRead += Buffer.byteLength(line) + 1;

        // Calculate percentage progress and construct ASCII progress bar
        const progress = bytesRead / totalBytes;
        const formattedPercent = (progress * 100).toFixed(1);

        if (formattedPercent !== lastRenderedPercent) {
            lastRenderedPercent = formattedPercent;
            const filledWidth = Math.round(progress * progressBarWidth);

            const progressBar =
                "█".repeat(filledWidth) +
                "-".repeat(progressBarWidth - filledWidth);

            // Render progress bar dynamically on current CLI line
            process.stdout.write(
                `\r[${progressBar}] ${formattedPercent}%`
            );
        }

        // Parse line and attempt to finalize complete message object
        const parsedMessageObj = parseMessageLine(line, state);

        if (parsedMessageObj) {
            await onMessageParsed(parsedMessageObj);
        }
    }

    // Process any remaining tail message left in the accumulator state at EOF
    if (state.accumulatedMessageBuffer !== "") {
        await onMessageParsed(parseMessageText(state.accumulatedMessageBuffer));
    }

    console.log("\nImport complete.");
}



