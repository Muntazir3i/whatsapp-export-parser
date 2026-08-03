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

let result = parseMessageText("4/5/20, 3:05 PM - MDOT: <Media omitted>");


export function classifyMessage(msgObj){
    if(msgObj.sender === null ){
        return {...msgObj, type:"system"}
    }else if (msgObj.message === "<Media omitted>"){
        return {...msgObj, type:"media"}
    }else if(msgObj.message === "You deleted this message" || msgObj.message === "This message was deleted" ){
        return {...msgObj, type:"deleted"}
    }else{
        return {...msgObj, type:"text"}
    }
}

console.log(classifyMessage(result));


