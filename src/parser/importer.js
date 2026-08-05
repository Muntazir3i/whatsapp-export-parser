/**
 * @file importer.js
 * @description High-level stream importer for reading WhatsApp export files, tracking import progress, and invoking callbacks for parsed messages.
 */

import { createLineReader, getFileByteSize } from "./reader.js";
import { MessageStreamBuffer } from "./messageParser.js";

/**
 * Extracts the relative file name and contact name from the file path.
 *
 * @param {string} filePath - Target chat export file path string.
 * @returns {[string, string]} Array containing `[fileName, contactName]`.
 */
export function extractChatFileInfo(filePath) {
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
 * UI Reporter that renders a CLI ASCII progress bar.
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
     * Renders or updates progress output on stdout.
     * 
     * @param {number} bytesRead - Bytes processed so far.
     * @param {number} totalBytes - Total file byte size.
     */
    update(bytesRead, totalBytes) {
        const progressFraction = bytesRead / totalBytes;
        const formattedPercent = (progressFraction * 100).toFixed(1);

        if (formattedPercent !== this.lastRenderedPercent) {
            this.lastRenderedPercent = formattedPercent;
            const filledWidth = Math.round(progressFraction * this.barWidth);
            const progressBar = "█".repeat(filledWidth) + "-".repeat(this.barWidth - filledWidth);

            process.stdout.write(`\r[${progressBar}] ${formattedPercent}%`);
        }
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



