/**
 * @file importChat.js
 * @description
 * Demonstrates importing a WhatsApp ZIP export by:
 * - Prompting the user for the ZIP file path.
 * - Extracting the archive.
 * - Reading the extracted directory contents.
 */

import extract from "extract-zip";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { extractChatFileInfo } from "../parser/importer.js";

const rl = readline.createInterface({
    input,
    output
});

const zipPath = await rl.question("Enter ZIP file path: ");

const [fileName, contact] = extractChatFileInfo(zipPath);

console.log(fileName, contact);



rl.close();

/**
 * Extracts a ZIP archive into the specified directory.
 *
 * @param {string} zipFilePath - Path to the ZIP archive.
 * @param {string} outputDir - Destination directory for the extracted files.
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
    }
}

await extractZip(zipPath, `../data/imports/${contact}`);  

const items = await readdir(`../data/imports/${contact}`);

console.log(items);