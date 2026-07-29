

/**
 * @file messageParser.js
 * @description Logic for identifying message start lines, parsing WhatsApp export line formats, and building structured message objects.
 */

/**
 * Checks if a string line begins with a valid date prefix (DD/MM/YY format).
 *
 * @param {string} txt - The line text to evaluate.
 * @returns {boolean} True if the prefix represents a valid date, false otherwise.
 */
function checkDate(txt) {
    let dateString = txt.slice(0, 8);
    let [day, month, year] = dateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    return !Number.isNaN(dateObj.getDate());
}

/**
 * Parses a raw single-line or multi-line WhatsApp message string into a structured object.
 *
 * @param {string} text - Raw message string (formatted like "DD/MM/YY, HH:MM - Sender: Message").
 * @returns {Object} Structured message object with `sender`, `message`, and `timestamp`.
 */
export function buildMessageObject(text) {
    // 1. Separate the timestamp from the sender and message content
    const [timestampStr, rest] = text.split(" - ");

    // 2. Separate the sender name/number from the message body
    const [sender, ...msgParts] = rest.split(": ");
    const msg = msgParts.join(": "); // Safely handles colons present within the message content

    // 3. Separate date and time components (e.g. "DD/MM/YY, HH:MM")
    const [dateStr, timeStr] = timestampStr.split(", ");

    return {
        sender: sender,
        message: msg,
        timestamp: `${dateStr} ${timeStr}`,
    };
}

/**
 * Stateful line parser that accumulates multi-line WhatsApp messages.
 * When a line starting with a valid date prefix is encountered, any currently building message is finalized and returned.
 *
 * @param {string} text - Current line read from the export stream.
 * @param {Object} state - State accumulator object containing `buildingMsg`.
 * @param {string} state.buildingMsg - Currently accumulated raw message text.
 * @returns {Object|null} Completed message object if a new message boundary was found, or null if accumulating.
 */
export function msgParser(text, state) {
    let validDate = checkDate(text);
    let completedMsg = null;

    if (validDate) {
        // If state already holds a message string, build and return the completed message object
        if (state.buildingMsg !== "") {
            completedMsg = buildMessageObject(state.buildingMsg);
        }
        // Start accumulating the new message
        state.buildingMsg = text;
    } else {
        // Continuation line of a multi-line message: append with line break
        state.buildingMsg += `\n${text}`;
    }

    return completedMsg;
}



