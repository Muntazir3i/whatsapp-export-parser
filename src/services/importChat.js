/**
 * @file importChat.js
 * @description
 * Imports a WhatsApp ZIP export by:
 * - Prompting the user for the ZIP file path.
 * - Extracting the archive.
 * - Locating the exported chat text file.
 */

import extract from "extract-zip";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";
import { extractChatFileInfo } from "../parser/importer.js";


export async function grabFileLocation() {

    const rl = readline.createInterface({
        input,
        output
    });

    const zipPath = await rl.question("Enter ZIP file path: ");
    rl.close();
    const [fileName, contact] = extractChatFileInfo(zipPath);
    const importDir = path.join("./src/data/imports", contact);
    return [zipPath,importDir];

}



/**
 * Extracts a ZIP archive into the specified directory.
 *
 * @param {string} zipFilePath - Path to the ZIP archive.
 * @param {string} outputDir - Destination directory for extracted files.
 */
export async function extractZip(zipFilePath, outputDir) {
    try {
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, {
                recursive: true
            });
        }

        await extract(zipFilePath, {
            dir: path.resolve(outputDir)
        });

        console.log("✅ ZIP extracted successfully.");
        console.log("Extracted to:", outputDir);

    } catch (err) {
        console.error("❌ Failed to extract ZIP.");
        console.error(err);
        throw err;
    }
}

/**
 * Finds the exported WhatsApp chat text file inside an extracted import folder.
 *
 * @param {string} importDir - Directory containing the extracted ZIP contents.
 * @returns {Promise<string>} Absolute/relative path to the chat text file.
 */
export async function findChatFile(importDir) {
    const items = await readdir(importDir);

    const textFile = items.find(item => item.endsWith(".txt"));

    if (!textFile) {
        throw new Error("No WhatsApp chat text file found.");
    }

    return path.join(importDir, textFile);
}

// // Extract the ZIP
// await extractZip(zipPath, importDir);

// // Locate the exported chat file
// const chatFilePath = await findChatFile(importDir);

// console.log("Chat file found at:");
// console.log(chatFilePath);