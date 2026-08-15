/**
 * @file importChat.js
 * @description Service for resolving WhatsApp export file locations, handling ZIP extraction, and locating target text files.
 */

import extract from "extract-zip";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";
import { extractChatFileInfo } from "../parser/importer.js";

/**
 * Resolves and validates a WhatsApp export file path (.zip or .txt), prompting via CLI input if not provided.
 *
 * @param {string} [inputPath] - Optional file path string.
 * @returns {Promise<{ filePath: string, importDir: string, isZip: boolean }>} File location descriptor object.
 */
export async function grabFileLocation(inputPath) {
    let targetPath = inputPath;

    if (!targetPath) {
        const rl = readline.createInterface({ input, output });
        const rawPath = await rl.question("Enter WhatsApp export file path (.zip or .txt): ");
        rl.close();
        targetPath = rawPath;
    }

    targetPath = targetPath.trim().replace(/^['"]|['"]$/g, ""); // strip accidental quotes

    if (!targetPath) {
        throw new Error("No file path provided.");
    }

    if (!existsSync(targetPath)) {
        throw new Error(`Specified file path does not exist: "${targetPath}"`);
    }

    const [_, contact] = extractChatFileInfo(targetPath);
    const importDir = path.join("./src/data/imports", contact);
    const isZip = targetPath.toLowerCase().endsWith(".zip");

    return { filePath: targetPath, importDir, isZip };
}

/**
 * Extracts a ZIP archive into the specified destination directory with entry progress reporting.
 *
 * @param {string} zipFilePath - Absolute or relative path to the ZIP archive.
 * @param {string} outputDir - Destination directory for extracted contents.
 * @param {Function} [onProgress] - Optional callback `(entriesProcessed, totalEntries, fileName) => void`.
 */
export async function extractZip(zipFilePath, outputDir, onProgress) {
    try {
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        let entriesProcessed = 0;

        await extract(zipFilePath, {
            dir: path.resolve(outputDir),
            onEntry: (entry, zipfile) => {
                entriesProcessed++;
                if (onProgress) {
                    onProgress(entriesProcessed, zipfile.entryCount, entry.fileName);
                }
            }
        });
    } catch (err) {
        console.error("\n❌ Failed to extract ZIP archive:", err.message);
        throw err;
    }
}

/**
 * Finds the exported WhatsApp chat text file inside an extracted directory.
 *
 * @param {string} importDir - Directory containing extracted ZIP contents.
 * @returns {Promise<string>} Path to the located chat text file.
 */
export async function findChatFile(importDir) {
    const items = await readdir(importDir, { recursive: true });
    // Prioritize _chat.txt or any .txt export file
    const textFile = items.find(item => item.endsWith("_chat.txt") || item.endsWith(".txt"));

    if (!textFile) {
        throw new Error(`No WhatsApp chat text (.txt) file found in "${importDir}".`);
    }

    return path.join(importDir, textFile);
}