

function checkDate(txt) {
    let dateString = txt.slice(0, 8);
    let [day, month, year] = dateString.split("/");
    let dateObj = new Date(year, month - 1, day);
    return !Number.isNaN(dateObj.getDate())
}

export function buildMessageObject(text) {

    // 1. Separate the timestamp from the sender and message
    const [timestampStr, rest] = text.split(" - ");

    // 2. Separate the sender from the message
    const [sender, ...msgParts] = rest.split(": ");
    const msg = msgParts.join(": "); // Safely handles colons inside the message

    // 3. Separate date and time components
    const [dateStr, timeStr] = timestampStr.split(", ");

    // 4. Convert DD/MM/YYYY to YYYY-MM-DD for JavaScript Date compatibility
    const [day, month, year] = dateStr.split("/");
    const standardizedDateStr = `${year}-${month}-${day} ${timeStr}`;
    const jsDate = new Date(standardizedDateStr);

    return {
        sender: sender,
        message: msg,
        timestamp: `${dateStr} ${timeStr}`,

    }


}
;


export function msgParser(text, state) {
    let validDate = checkDate(text);
    let completedMsg = null;
    if (validDate) {
        
        if (state.buildingMsg !== "") {
            completedMsg = buildMessageObject(state.buildingMsg);
        }
        
        state.buildingMsg = text;
    } else {
        
        state.buildingMsg += `\\n${text}`;
    }

    return completedMsg;
}



