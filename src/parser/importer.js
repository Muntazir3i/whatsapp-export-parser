/**
 * @file importer.js
 * @description High-level stream importer for reading WhatsApp export files, tracking import progress, and invoking callbacks for parsed messages.
 */

import { fileStream } from "./reader.js";
import { msgParser, buildMessageObject } from "./messageParser.js";
import fs from "fs";

/**
 * Extracts the relative file name and contact name from the file path.
 *
 * @param {string} location - File path string.
 * @returns {[string, string]} Array containing `[fileName, contactName]`.
 */
function fileNameExtractor(location) {
    let indexOfWith = location.indexOf("with") + 5;

    let fileName = location.slice(indexOfWith);
    let indexOfDot = fileName.indexOf(".");
    let name = fileName.slice(0, indexOfDot);

    return [fileName, name];
}

/**
 * Prepares chat metadata (chat name and file name) from a target export path.
 *
 * @param {string} location - File path string to export file.
 * @returns {{ name: string, file_name: string }} Chat metadata object.
 */
export function importChat(location) {
    let [fileName, name] = fileNameExtractor(location);
    return { name: name, file_name: fileName };
}

/**
 * Streams messages line-by-line from a text file, displaying a CLI progress bar, and invoking a callback for each parsed message.
 *
 * @param {string} location - Path to the WhatsApp export `.txt` file.
 * @param {Function} onMessage - Async callback function `(msgObj) => Promise<void>` invoked when a message object is ready.
 */
export async function importMessage(location, onMessage) {
    // Obtain readline interface for streaming file read
    const rl = fileStream(location);

    // Compute total file size in bytes for progress calculation
    const totalBytes = fs.statSync(location).size;
    let bytesRead = 0;
    const width = 30; // Terminal progress bar character width

    // Mutable state container to hold partially built multi-line messages
    const state = { buildingMsg: "" };

    for await (const line of rl) {
        if (line.length === 0) continue;

        // Update byte count (line byte length + 1 byte for newline separator)
        bytesRead += Buffer.byteLength(line) + 1;

        // Calculate percentage progress and construct ASCII progress bar
        const progress = bytesRead / totalBytes;
        const filled = Math.round(progress * width);

        const bar =
            "█".repeat(filled) +
            "-".repeat(width - filled);

        // Render progress bar dynamically on current CLI line
        process.stdout.write(
            `\r[${bar}] ${(progress * 100).toFixed(1)}%`
        );

        // Parse line and attempt to finalize complete message object
        const msgObj = msgParser(line, state);

        if (msgObj) {
            await onMessage(msgObj);
        }
    }

    // Process any remaining tail message left in the accumulator state at EOF
    if (state.buildingMsg !== "") {
        await onMessage(buildMessageObject(state.buildingMsg));
    }

    console.log("\nImport complete.");
}



