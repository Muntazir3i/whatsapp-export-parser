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
    const [timestampStr] = lineText.split(" - ");
    const [dateString] = timestampStr.split(", ")
    let [day, month, year] = dateString.split("/");
    let fullYear = "20" + year;
    let dateObj = new Date(fullYear, month - 1, day);
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
    if (rest.includes(": ")) {
        const [sender, ...msgParts] = rest.split(": ");
        const messageContent = msgParts.join(": ");
        const [dateStr, timeStr] = timestampStr.split(", ");

        return {
            sender: sender,
            message: messageContent,
            timestamp: `${dateStr} ${timeStr}`
        };
    } else {
        const [messageContent] = rest.split()
        const [dateStr, timeStr] = timestampStr.split(", ");
        return {
            sender: null,
            message: messageContent,
            timestamp: `${dateStr} ${timeStr}`
        }
    }
}

/**
 * Classifies a parsed WhatsApp message and assigns a message type.
 *
 * Determines whether the message is a normal text message, media placeholder,
 * deleted message, or a WhatsApp system event, and returns the original
 * message object with an added `type` property.
 *
 * @param {Object} msgObj - Parsed message object containing `sender`, `message`, and `timestamp`.
 * @returns {Object} Message object with an additional `type` property.
 */

export function classifyMessage(msgObj) {
    if (msgObj.sender === null) {
        return { ...msgObj, type: "system" }
    } else if (msgObj.message === "<Media omitted>") {
        return { ...msgObj, type: "media" }
    } else if (msgObj.message === "You deleted this message" || msgObj.message === "This message was deleted") {
        return { ...msgObj, type: "deleted" }
    } else {
        return { ...msgObj, type: "text" }
    }
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
                completedMsg = classifyMessage(parseMessageText(this.buffer));
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
            const finalMsg = classifyMessage(parseMessageText(this.buffer));
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






