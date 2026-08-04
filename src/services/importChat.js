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

const rl = readline.createInterface({
    input,
    output
});

const zipPath = await rl.question("Enter ZIP file path: ");

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

await extractZip(zipPath, "./temp");

const items = await readdir("./temp");

console.log(items);