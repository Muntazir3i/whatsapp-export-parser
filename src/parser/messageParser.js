/**
 * @file messageParser.js
 * @description Logic for identifying message start lines, parsing WhatsApp export line formats, and building structured message objects.
 */

/**
 * Checks if a string line begins with a valid date prefix (DD/MM/YY format).
 *
 * @param {string} lineText - The line text to evaluate.
 * @returns {boolean} True if the prefix represents a valid date, false otherwise.
 */
export function isMessageStartLine(lineText) {
    let dateString = lineText.slice(0, 8);
    let [day, month, year] = dateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    return !Number.isNaN(dateObj.getDate());
}

/**
 * Parses a raw single-line or multi-line WhatsApp message string into a structured object.
 *
 * @param {string} rawMessageText - Raw message string (formatted like "DD/MM/YY, HH:MM - Sender: Message").
 * @returns {Object} Structured message object with `sender`, `message`, and `timestamp`.
 */
export function parseMessageText(rawMessageText) {
    const [timestampStr, rest] = rawMessageText.split(" - ");
    const [sender, ...msgParts] = rest.split(": ");
    const messageContent = msgParts.join(": ");
    const [dateStr, timeStr] = timestampStr.split(", ");

    return {
        sender: sender,
        message: messageContent,
        timestamp: `${dateStr} ${timeStr}`,
    };
}

/**
 * Encapsulates multi-line message buffering and line parsing state.
 */
export class MessageStreamBuffer {
    constructor() {
        this.buffer = "";
    }

    /**
     * Processes a single line read from the export stream.
     * 
     * @param {string} line - Current line from the chat file.
     * @returns {Object|null} Parsed message object if a message boundary was completed, or null if accumulating.
     */
    processLine(line) {
        if (isMessageStartLine(line)) {
            let completedMsg = null;
            if (this.buffer !== "") {
                completedMsg = parseMessageText(this.buffer);
            }
            this.buffer = line;
            return completedMsg;
        } else {
            this.buffer += `\n${line}`;
            return null;
        }
    }

    /**
     * Flushes and returns any remaining message buffered at the end of stream.
     * 
     * @returns {Object|null} Final message object, or null if buffer is empty.
     */
    flush() {
        if (this.buffer !== "") {
            const finalMsg = parseMessageText(this.buffer);
            this.buffer = "";
            return finalMsg;
        }
        return null;
    }
}

/**
 * Functional wrapper for legacy state object parsing.
 * 
 * @param {string} currentLine - Line to parse.
 * @param {Object} state - State container object.
 * @returns {Object|null} Completed message object or null.
 */


/**
export function parseMessageLine(currentLine, state) {
    let hasValidDatePrefix = isMessageStartLine(currentLine);
    let completedMessageObj = null;

    if (hasValidDatePrefix) {
        if (state.accumulatedMessageBuffer !== "") {
            completedMessageObj = parseMessageText(state.accumulatedMessageBuffer);
        }
        state.accumulatedMessageBuffer = currentLine;
    } else {
        state.accumulatedMessageBuffer += `\n${currentLine}`;
    }

    return completedMessageObj;
}
 */


/** Simple Implementation Of Edge Case Function  */






