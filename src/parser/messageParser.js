/**
 * @file messageParser.js
 * @description Robust multi-format WhatsApp message parser supporting Android, iOS (iPhone), 12/24-hour clocks, regional dates, and Unicode control characters.
 */

// Compiled regex for iOS (bracketed) format: [15/08/2026, 19:30:45] Sender: Message OR [15/08/2026, 19:30:45] System message
const IOS_HEADER_REGEX = /^\[(\d{1,4}[./\-]\d{1,2}[./\-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[\u202f\u00a0\s]?[AP]\.?M\.?)?)\]\s+(?:([^:]+):\s+)?([\s\S]*)$/i;

// Compiled regex for Android (dash-separated) format: 15/08/2026, 19:30 - Sender: Message OR 15/08/2026, 19:30 - System message
const ANDROID_HEADER_REGEX = /^(\d{1,4}[./\-]\d{1,2}[./\-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[\u202f\u00a0\s]?[AP]\.?M\.?)?)\s+-\s+(?:([^:]+):\s+)?([\s\S]*)$/i;

/**
 * Sanitizes a line string by removing invisible Unicode control and directionality characters.
 *
 * @param {string} lineText - Raw line from export file.
 * @returns {string} Cleaned line string.
 */
export function cleanLine(lineText) {
    if (!lineText) return "";
    return lineText.replace(/[\u200e\u200f\u200b-\u200d\u202a-\u202e\ufeff]/g, "").trim();
}

/**
 * Evaluates whether a line matches a recognized WhatsApp message header format.
 *
 * @param {string} lineText - Line text to evaluate.
 * @returns {{ dateStr: string, timeStr: string, sender: string|null, message: string }|null} Parsed header details or null if no match.
 */
export function matchMessageHeader(lineText) {
    const cleaned = cleanLine(lineText);
    if (!cleaned) return null;

    let match = cleaned.match(IOS_HEADER_REGEX);
    if (match) {
        return {
            dateStr: match[1],
            timeStr: match[2],
            sender: match[3] ? match[3].trim() : null,
            message: match[4] || ""
        };
    }

    match = cleaned.match(ANDROID_HEADER_REGEX);
    if (match) {
        return {
            dateStr: match[1],
            timeStr: match[2],
            sender: match[3] ? match[3].trim() : null,
            message: match[4] || ""
        };
    }

    return null;
}

/**
 * Checks if a line represents the start of a new WhatsApp message.
 *
 * @param {string} lineText - Line text to evaluate.
 * @returns {boolean} True if the line starts a new message, false otherwise.
 */
export function isMessageStartLine(lineText) {
    return matchMessageHeader(lineText) !== null;
}

/**
 * Parses a single-line or multi-line WhatsApp export message string into a structured object.
 *
 * @param {string} rawMessageText - Raw message text.
 * @returns {{ sender: string|null, message: string, timestamp: string }} Structured message object.
 */
export function parseMessageText(rawMessageText) {
    const headerMatch = matchMessageHeader(rawMessageText);
    if (headerMatch) {
        return {
            sender: headerMatch.sender,
            message: headerMatch.message,
            timestamp: `${headerMatch.dateStr} ${headerMatch.timeStr}`
        };
    }

    return {
        sender: null,
        message: cleanLine(rawMessageText),
        timestamp: "Unknown"
    };
}

/**
 * Classifies a parsed message object and attaches a `type` property.
 *
 * @param {{ sender: string|null, message: string, timestamp: string }} msgObj - Parsed message object.
 * @returns {Object} Message object containing `type` ("text", "media", "deleted", or "system").
 */
export function classifyMessage(msgObj) {
    if (!msgObj) return { sender: null, message: "", timestamp: "", type: "text" };

    const content = msgObj.message || "";

    if (msgObj.sender === null) {
        return { ...msgObj, type: "system" };
    } else if (
        content === "<Media omitted>" ||
        content.startsWith("<attached:") ||
        content.toLowerCase().includes("omitted") ||
        content.toLowerCase().includes("attached media")
    ) {
        return { ...msgObj, type: "media" };
    } else if (
        content === "You deleted this message" ||
        content === "This message was deleted" ||
        content.toLowerCase().includes("deleted this message")
    ) {
        return { ...msgObj, type: "deleted" };
    } else {
        return { ...msgObj, type: "text" };
    }
}

/**
 * Encapsulates multi-line message buffering and streaming line ingestion.
 */
export class MessageStreamBuffer {
    constructor() {
        this.buffer = "";
    }

    /**
     * Ingests a single line from the chat stream.
     * 
     * @param {string} line - Current line from export file.
     * @returns {Object|null} Completed message object if boundary reached, else null.
     */
    processLine(line) {
        const cleaned = cleanLine(line);
        if (!cleaned && this.buffer === "") {
            return null;
        }

        if (isMessageStartLine(line)) {
            let completedMsg = null;
            if (this.buffer !== "") {
                completedMsg = classifyMessage(parseMessageText(this.buffer));
            }
            this.buffer = cleaned;
            return completedMsg;
        } else {
            if (this.buffer !== "") {
                this.buffer += `\n${line}`;
            } else {
                this.buffer = cleaned;
            }
            return null;
        }
    }

    /**
     * Flushes remaining message in buffer at end of stream.
     * 
     * @returns {Object|null} Final message object or null.
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
