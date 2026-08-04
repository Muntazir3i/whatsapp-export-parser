import extract from "extract-zip";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";

/**
 * Extracts a ZIP archive.
 *
 * @param {string} zipFilePath - Absolute path to the ZIP file.
 * @param {string} outputDir - Directory where files should be extracted.
 */
export async function extractZip(zipFilePath, outputDir) {
    try {
        // Create output directory if it doesn't exist
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        await extract(zipFilePath, {
            dir: path.resolve(outputDir)
        });

        console.log("✅ ZIP extracted successfully.");
        console.log("Extracted to:", outputDir);
    } catch (err) {
        console.error("❌ Failed to extract ZIP:");
        console.error(err);
    }
}


await extractZip("file_location", "./temp");


const items = await readdir("./temp");
console.log(items);
