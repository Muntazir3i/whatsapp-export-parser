

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
function isMessageStartLine(lineText) {
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
    // 1. Separate the timestamp from the sender and message content
    const [timestampStr, rest] = rawMessageText.split(" - ");

    // 2. Separate the sender name/number from the message body
    const [sender, ...msgParts] = rest.split(": ");
    const messageContent = msgParts.join(": "); // Safely handles colons present within the message content

    // 3. Separate date and time components (e.g. "DD/MM/YY, HH:MM")
    const [dateStr, timeStr] = timestampStr.split(", ");

    return {
        sender: sender,
        message: messageContent,
        timestamp: `${dateStr} ${timeStr}`,
    };
}

/**
 * Stateful line parser that accumulates multi-line WhatsApp messages.
 * When a line starting with a valid date prefix is encountered, any currently building message is finalized and returned.
 *
 * @param {string} currentLine - Current line read from the export stream.
 * @param {Object} state - State accumulator object containing `accumulatedMessageBuffer`.
 * @param {string} state.accumulatedMessageBuffer - Currently accumulated raw message text.
 * @returns {Object|null} Completed message object if a new message boundary was found, or null if accumulating.
 */
export function parseMessageLine(currentLine, state) {
    let hasValidDatePrefix = isMessageStartLine(currentLine);
    let completedMessageObj = null;

    if (hasValidDatePrefix) {
        // If state already holds accumulated text, build and return the completed message object
        if (state.accumulatedMessageBuffer !== "") {
            completedMessageObj = parseMessageText(state.accumulatedMessageBuffer);
        }
        // Start accumulating the new message
        state.accumulatedMessageBuffer = currentLine;
    } else {
        // Continuation line of a multi-line message: append with newline separator
        state.accumulatedMessageBuffer += `\n${currentLine}`;
    }

    return completedMessageObj;
}



