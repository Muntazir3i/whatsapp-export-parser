import { fileStream } from "./reader.js";
import { msgParser, buildMessageObject } from "./messageParser.js";


function fileNameExtractor(location) {

    let indexOfWith = location.indexOf("with") + 5;

    let fileName = location.slice(indexOfWith);
    let indexOfDot = fileName.indexOf(".");
    let name = fileName.slice(0, indexOfDot);

    return [fileName, name];
}

export function importChat(location) {
    let [fileName, name] = fileNameExtractor(location);
    return { name: name, file_name: fileName }
}

import fs from "fs";

export async function importMessage(location, onMessage) {
    const rl = fileStream(location);

    const totalBytes = fs.statSync(location).size;
    let bytesRead = 0;
    const width = 30;

    const state = { buildingMsg: "" };

    for await (const line of rl) {
        if (line.length === 0) continue;

        bytesRead += Buffer.byteLength(line) + 1;

        const progress = bytesRead / totalBytes;
        const filled = Math.round(progress * width);

        const bar =
            "█".repeat(filled) +
            "-".repeat(width - filled);

        process.stdout.write(
            `\r[${bar}] ${(progress * 100).toFixed(1)}%`
        );

        const msgObj = msgParser(line, state);

        if (msgObj) {
            await onMessage(msgObj);
        }
    }

    if (state.buildingMsg !== "") {
        await onMessage(buildMessageObject(state.buildingMsg));
    }

    console.log("\nImport complete.");
}



