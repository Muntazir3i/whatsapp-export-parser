/**
 * @file importer.js
 * @description High-level stream importer for reading WhatsApp export files, tracking import progress, and invoking callbacks for parsed messages.
 */

import { createLineReader, getFileByteSize } from "./reader.js";
import { MessageStreamBuffer } from "./messageParser.js";

import path from "path";

/**
 * Extracts the relative file name and contact name from the file path.
 *
 * @param {string} filePath - Target chat export file path string.
 * @returns {[string, string]} Array containing `[fileName, contactName]`.
 */
export function extractChatFileInfo(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName);
    let baseNameWithoutExt = path.basename(fileName, ext);

    // If file is "_chat.txt" (iOS default), extract contact name from parent folder
    if (baseNameWithoutExt.toLowerCase() === "_chat") {
        const parentDir = path.basename(path.dirname(filePath));
        if (parentDir && parentDir !== "." && parentDir !== "imports") {
            baseNameWithoutExt = parentDir;
        }
    }

    const match = baseNameWithoutExt.match(/(?:WhatsApp\s+Chat(?:\s+with|\s+-)?|\bChat\s+with)\s+(.+)$/i);
    const contactName = match ? match[1].trim() : baseNameWithoutExt.trim();

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
 * UI Reporter that renders a CLI ASCII progress bar for extraction and message ingestion.
 */
export class ConsoleProgressReporter {
    /**
     * @param {number} [barWidth=30] - Character width of the progress bar.
     */
    constructor(barWidth = 30) {
        this.barWidth = barWidth;
        this.lastRenderedPercent = "";
    }

    /**
     * Renders or updates progress output on stdout for streaming file reads.
     * 
     * @param {number} bytesRead - Bytes processed so far.
     * @param {number} totalBytes - Total file byte size.
     */
    update(bytesRead, totalBytes) {
        const progressFraction = totalBytes > 0 ? bytesRead / totalBytes : 1;
        const formattedPercent = (progressFraction * 100).toFixed(1);

        if (formattedPercent !== this.lastRenderedPercent) {
            this.lastRenderedPercent = formattedPercent;
            const filledWidth = Math.round(progressFraction * this.barWidth);
            const progressBar = "█".repeat(filledWidth) + "-".repeat(this.barWidth - filledWidth);

            process.stdout.write(`\rImporting: [${progressBar}] ${formattedPercent}%`);
        }
    }

    /**
     * Renders or updates ZIP extraction progress on stdout.
     * 
     * @param {number} currentEntry - Current entry number extracted.
     * @param {number} totalEntries - Total number of entries in ZIP.
     */
    updateZip(currentEntry, totalEntries) {
        const progressFraction = totalEntries > 0 ? currentEntry / totalEntries : 1;
        const formattedPercent = (progressFraction * 100).toFixed(1);

        if (formattedPercent !== this.lastRenderedPercent) {
            this.lastRenderedPercent = formattedPercent;
            const filledWidth = Math.round(progressFraction * this.barWidth);
            const progressBar = "█".repeat(filledWidth) + "-".repeat(this.barWidth - filledWidth);

            process.stdout.write(`\rUnzipping: [${progressBar}] ${formattedPercent}% (${currentEntry}/${totalEntries})`);
        }
    }

    /**
     * Prints completion message for ZIP extraction.
     */
    completeZip() {
        process.stdout.write("\n✅ ZIP extraction complete.\n");
        this.lastRenderedPercent = "";
    }

    /**
     * Prints completion message and moves stdout to a new line.
     */
    complete() {
        process.stdout.write("\nImport complete.\n");
    }
}

/**
 * Streams messages line-by-line from a text file and invokes a callback for each parsed message.
 *
 * @param {string} filePath - Path to the WhatsApp export `.txt` file.
 * @param {Function} onMessageParsed - Async callback `(messageObj) => Promise<void>` when a message is ready.
 * @param {Function} [onProgress] - Optional progress callback `(bytesRead, totalBytes) => void`.
 */
export async function streamChatMessages(filePath, onMessageParsed, onProgress) {
    const lineReader = createLineReader(filePath);
    const totalBytes = getFileByteSize(filePath);
    let bytesRead = 0;

    const messageBuffer = new MessageStreamBuffer();

    for await (const line of lineReader) {
        if (line.length === 0){
            bytesRead += Buffer.byteLength(line) + 1;
            continue;
        } 

        // Byte tracking (+1 byte for newline character)
        bytesRead += Buffer.byteLength(line) + 1;

        if (onProgress) {
            onProgress(bytesRead, totalBytes);
        }

        const parsedMessage = messageBuffer.processLine(line);
        if (parsedMessage) {
            await onMessageParsed(parsedMessage);
        }
    }

    // Flush final trailing message at end of stream
    const finalMessage = messageBuffer.flush();
    if (finalMessage) {
        await onMessageParsed(finalMessage);
    }
}



