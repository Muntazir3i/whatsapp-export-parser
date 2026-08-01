export function parseMessageText(rawMessageText) {
    const [timestampStr, rest] = rawMessageText.split(" - ");
    if(rest.includes(": ")){
        const [sender, ...msgParts] = rest.split(": ");
    const messageContent = msgParts.join(": ");
    const [dateStr, timeStr] = timestampStr.split(", ");

    return {
        sender: sender,
        message: messageContent,
        timestamp: `${dateStr} ${timeStr}`,
    };
    }else{
        const [messageContent] = rest.split()
        const [dateStr, timeStr] = timestampStr.split(", ");
               return {
          sender: null,
          message: messageContent,
          timestamp: `${dateStr} ${timeStr}`
    }
    }
}

let result = parseMessageText("20/07/26, 10:25 AM - Sara joined using this group's invite link")
console.log(result)
//






